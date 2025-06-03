import { Request } from 'express';
import AbstractServices from '../../abstarcts/abstract.service';
import {
  IAccHeadDb,
  IinsertAccHeadReqBody,
} from '../utlis/interfaces/doubleEntry.interface';
import { journalFormatter } from '../utlis/interfaces/doubleEntry.utils';
import {
  IAccountCreateBody,
  IAccountReqBody,
} from '../utlis/interfaces/account.interface';
import {
  ACC_HEAD_CONFIG,
  ASSET_GROUP,
} from '../../utils/miscellaneous/constants';
import HelperLib from '../utlis/library/helperLib';

const accHeads = {
  CASH: {
    id: 94,
    code: '1001.001',
    group_code: '1000',
  },
  BANK: {
    id: 112,
    code: '1001.002',
    group_code: '1000',
  },
  MOBILE_BANKING: {
    id: 71,
    code: '1000.001.004',
    group_code: '1000',
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
      const { hotel_code, id } = req.hotel_admin;
      const model = this.Model.accountModel(trx);

      for (const head of name) {
        let newHeadCode = '';
        if (parent_id) {
          const parentHead = await model.getAccountHead({
            hotel_code,
            group_code,
            id: parent_id,
          });

          if (!parentHead.length) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'Parent head not found!',
            };
          }

          const { code: parent_head_code } = parentHead[0];

          const heads = await model.getAccountHead({
            hotel_code,
            group_code,
            parent_id,
            order_by: 'ah.code',
            order_to: 'desc',
          });

          if (heads.length) {
            const { code: child_code } = heads[0];

            const lastHeadCodeNum = child_code.split('.');
            const newNum =
              Number(lastHeadCodeNum[lastHeadCodeNum.length - 1]) + 1;

            newHeadCode = lastHeadCodeNum.pop();
            newHeadCode = lastHeadCodeNum.join('.');

            if (newNum < 10) {
              newHeadCode += '.00' + newNum;
            } else if (newNum < 100) {
              newHeadCode += '.0' + newNum;
            } else {
              newHeadCode += '.' + newNum;
            }
          } else {
            newHeadCode = parent_head_code + '.001';
          }
        } else {
          const checkHead = await model.getAccountHead({
            hotel_code,
            group_code,
            parent_id: null,
            order_by: 'ah.id',
            order_to: 'desc',
          });

          if (checkHead.length) {
            newHeadCode = Number(checkHead[0].code) + 1 + '';
          } else {
            newHeadCode = Number(group_code) + 1 + '';
          }
        }

        await model.insertAccHead({
          code: newHeadCode,
          created_by: id,
          group_code,
          hotel_code,
          name: head,
          parent_id,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Account head created successfully.',
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
    return this.db.transaction(async (trx) => {
      const { name, ac_type, opening_balance, ...rest } = req.body;
      const { id, hotel_code } = req.hotel_admin;
      const accModel = this.Model.accountModel(trx);
      const hotelModel = this.Model.HotelModel(trx);
      const subService = new HelperLib(trx);

      const checkName = await accModel.checkAccName({ name, hotel_code });

      if (checkName.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Account name already exist!',
        };
      }

      // Get parent head===========================================
      let parent_head = 0;

      if (ac_type === 'CASH') {
        const configData = await hotelModel.getHotelAccConfig(hotel_code, [
          ACC_HEAD_CONFIG.CASH_HEAD_ID,
        ]);

        parent_head = configData[0].head_id;
      } else if (ac_type === 'BANK') {
        const configData = await hotelModel.getHotelAccConfig(hotel_code, [
          ACC_HEAD_CONFIG.BANK_HEAD_ID,
        ]);

        parent_head = configData[0].head_id;
      } else if (ac_type === 'MOBILE_BANKING') {
        const configData = await hotelModel.getHotelAccConfig(hotel_code, [
          ACC_HEAD_CONFIG.MFS_HEAD_ID,
        ]);

        parent_head = configData[0].head_id;
      }

      // Create new account head for this account ==================

      const newHeadCode = await subService.createAccHeadCode({
        hotel_code,
        group_code: ASSET_GROUP,
        parent_id: parent_head,
      });

      if (!newHeadCode) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      const newHead = await accModel.insertAccHead({
        hotel_code,
        group_code: ASSET_GROUP,
        name,
        created_by: id,
        parent_id: parent_head,
        code: newHeadCode,
      });

      const createAccount = await accModel.createAccount({
        name,
        opening_balance,
        acc_head_id: newHead[0].id,
        ac_type,
        hotel_code,
        ...rest,
      });

      return {
        success: true,
        id: createAccount[0].id,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // get all accounts
  public async getAllAccount(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { ac_type, key, status, limit, skip, admin_id } = req.query;

    const { data, total } = await this.Model.accountModel().getAllAccounts({
      hotel_code,
      status: status as string,
      ac_type: ac_type as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
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
      message: 'Account updated successfully.',
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
        message: 'From account not found',
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
        message: 'To account not found',
      };
    }

    const { last_balance: from_acc_last_balance } = checkFromAcc[0];
    const { last_balance: to_acc_last_balance } = checkToAcc[0];

    if (pay_amount > from_acc_last_balance) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Pay amount is more than accounts balance',
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
      message: 'Balance transfered',
    };
  }
}
export default AccountService;
