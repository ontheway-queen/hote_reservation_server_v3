import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IAccHeadDb,
  IinsertAccHeadReqBody,
} from "../utlis/interfaces/doubleEntry.interface";
import { journalFormatter } from "../utlis/interfaces/doubleEntry.utils";
import { IAccountReqBody } from "../utlis/interfaces/account.interface";

const accHeads = {
  CASH: {
    id: 94,
    code: "1001.001",
    group_code: "1000",
  },
  BANK: {
    id: 112,
    code: "1001.002",
    group_code: "1000",
  },
  MOBILE_BANKING: {
    id: 71,
    code: "1000.001.004",
    group_code: "1000",
  },
};

export class AccountService extends AbstractServices {
  constructor() {
    super();
  }

  public async allGroups(req: Request) {
    const data = await this.Model.accountModel().allGroups();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getAllAccHeads(req: Request) {
    const query = req.query as {
      limit?: number;
      order_by?: string;
      search?: string;
      skip?: number;
      head_id?: string | number;
    };

    const data = await this.Model.accountModel().getAllAccHeads(query);

    return { success: true, code: this.StatusCode.HTTP_OK, ...data };
  }

  public async insertAccHead(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { group_code, name, parent_id } = req.body as IinsertAccHeadReqBody;
      const { hotel_code } = req.hotel_admin;
      const model = this.Model.accountModel(trx);

      const payload: IAccHeadDb[] = [];

      if (parent_id) {
        const parentHead = await model.getHeadCodeByHeadId(parent_id);
        const parentCode = parentHead.code;

        const isRoot = parentHead.parent_id === null;

        console.log({ isRoot });

        const lastChild = await model.getLastHeadCodeByHeadCode(
          parent_id,
          hotel_code,
          parentHead.group_code
        );

        let lastCode = "";

        if (!lastChild) {
          lastCode = isRoot ? parentCode : `${parentCode}.000`;
        } else {
          lastCode = lastChild.code;
        }

        for (const [index, item] of name.entries()) {
          let nextCode = "";

          if (isRoot) {
            // প্রথম লেভেলের child → 1001, 1002 ...
            nextCode = (parseInt(lastCode, 10) + index + 1).toString();
          } else {
            // nested → 1001.001, 1001.002 ...
            nextCode = model.generateNextGroupCode(lastCode, index);
          }

          payload.push({
            hotel_code,
            code: nextCode,
            created_by: req.hotel_admin.id,
            group_code: parentHead.group_code,
            name: item,
            parent_id,
          });
        }
      } else {
        // Root head insertion
        const existingRoot = await model.getLastRootHeadByGroup(group_code);

        if (existingRoot) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `Root head already exists for group ${group_code}.`,
          };
        }

        payload.push({
          hotel_code,
          code: group_code,
          created_by: req.hotel_admin.id,
          group_code,
          name: name[0],
          parent_id: undefined,
        });
      }

      await model.insertAccHead(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Account head created successfully.",
      };
    });
  }

  public async updateAccHead(req: Request) {
    const body = req.body;
    const id = req.params.id;

    const data = await this.Model.accountModel().updateAccHead(body, id);

    return { success: true, data };
  }

  public async deleteAccHead(req: Request) {
    const id = req.params.id;

    const data = await this.Model.accountModel().deleteAccHead(id);

    return { success: true, data };
  }

  public async allAccVouchers(req: Request) {
    const data = await this.Model.accountModel().allAccVouchers();

    return { success: true, data };
  }

  public async generalJournal(req: Request) {
    const vouchers = await this.Model.accountModel().allAccVouchers();

    const data = journalFormatter(vouchers);

    return { success: true, data };
  }

  public async createAccount(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const acc_model = this.Model.accountModel(trx);
      const { opening_balance, acc_opening_balance_type, ...body } =
        req.body as IAccountReqBody;

      const { group_code, id } = accHeads[body.ac_type];

      const payload: IAccHeadDb = {
        name: body.name,
        parent_id: id,
        code: "",
        hotel_code: req.hotel_admin.hotel_code,
        created_by: req.hotel_admin.id,
        group_code,
      };

      const parentHead = await acc_model.getHeadCodeByHeadId(id);

      const parentCode = parentHead.code;

      const lastChild = await acc_model.getLastHeadCodeByHeadCode(
        id,
        hotel_code,
        parentHead.group_code
      );

      let lastCode = lastChild?.code || `${parentCode}.000`;

      payload.code = acc_model.generateNextGroupCode(lastCode, 0);

      const insertAccHeadRes = await acc_model.insertAccHead(payload);

      body.acc_head_id = insertAccHeadRes[0].id;

      // insert account
      await acc_model.createAccount({ ...body, hotel_code });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Account created successfully!",
      };
    });
  }

  // get all accounts
  public async getAllAccount(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { ac_type, key, status, limit, skip, admin_id } = req.query;

    // model
    const model = this.Model.accountModel();

    // fetch all accounts for the given hotel_code
    const { data, total } = await model.getAllAccounts({
      hotel_code,
      status: status as string,
      ac_type: ac_type as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
      admin_id: parseInt(admin_id as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // update account
  public async updateAccount(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const id = parseInt(req.params.id);

    const { last_balance, ...rest } = req.body;

    const model = this.Model.accountModel();

    const account = await model.upadateSingleAccount(
      {
        ...rest,
        hotel_code,
        last_balance,
      },
      { hotel_code, id }
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Account updated successfully.",
    };
  }

  // balance transfer
  public async balanceTransfer(req: Request) {
    const { id, hotel_code } = req.hotel_admin;

    const { from_account, to_account, transfer_type, pay_amount } = req.body;

    // check account

    // model
    const model = this.Model.accountModel();

    // check from account
    const checkFromAcc = await model.getSingleAccount({
      hotel_code,
      id: from_account,
    });

    if (!checkFromAcc.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "From account not found",
      };
    }

    // check to account
    const checkToAcc = await model.getSingleAccount({
      hotel_code,
      id: to_account,
    });

    if (!checkToAcc.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "To account not found",
      };
    }

    const { last_balance: from_acc_last_balance } = checkFromAcc[0];
    const { last_balance: to_acc_last_balance } = checkToAcc[0];

    if (pay_amount > from_acc_last_balance) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Pay amount is more than accounts balance",
      };
    }

    //=========== from account step ==========//

    // get last account ledger
    const lastAL = await model.getLastAccountLedgerId(hotel_code);

    const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
    const year = new Date().getFullYear();

    // now inset in account ledger
    await model.insertAccountLedger({
      ac_tr_ac_id: from_account,
      hotel_code,
      transaction_no: `TRX-Balance-Transfer-${year - ledger_id}`,
      ledger_debit_amount: pay_amount,
      ledger_details: `Balance transfer to ${to_account}, total pay amount is = ${pay_amount}`,
    });

    //=========== to account step ==========//

    // now insert in account ledger
    await model.insertAccountLedger({
      ac_tr_ac_id: to_account,
      hotel_code,
      transaction_no: `TRX-Balance-Transfer-${year - ledger_id}`,
      ledger_credit_amount: pay_amount,

      ledger_details: `Balance transfered from ${from_account}, total paid amount is = ${pay_amount}`,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Balance transfered",
    };
  }
}
export default AccountService;
