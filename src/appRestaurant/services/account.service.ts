import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class RestaurantAccountService extends AbstractServices {
  constructor() {
    super();
  }

  // create Account
  public async createAccount(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { res_id, id, hotel_code } = req.rest_user;

      const { opening_balance, ...rest } = req.body;

      // model
      const accModel = this.Model.accountModel(trx);

      // insert account
      const res = await accModel.createAccount({
        ...rest,
        hotel_code,
        last_balance: opening_balance,
        res_id,
        created_by: id,
      });

      const year = new Date().getFullYear();
      // get last account ledger
      const lastAL = await accModel.getLastAccountLedgerId(hotel_code);

      const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;

      // insert in account ledger
      await accModel.insertAccountLedger({
        ac_tr_ac_id: res[0],
        hotel_code,
        transaction_no: `TRX-RES-ACCOUNT-${year}${ledger_id}`,
        ledger_credit_amount: opening_balance,
        ledger_details: `Opening balance has been credited for ${rest.name} account`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Account created successfully.",
      };
    });
  }

  // get all accounts
  public async getAllAccount(req: Request) {
    const { res_id, hotel_code } = req.rest_user;

    const { ac_type, key, status, limit, skip } = req.query;

    // model
    const model = this.Model.accountModel();

    // fetch all accounts for the given hotel_code
    const { data, total } = await model.getAllAccounts({
      res_id,
      status: status as string,
      ac_type: ac_type as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
      hotel_code,
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
    const { res_id, hotel_code } = req.rest_user;
    const id = parseInt(req.params.id);

    const { last_balance, ...rest } = req.body;

    await this.Model.accountModel().upadateSingleAccount(
      {
        ...rest,
        res_id,
        last_balance,
      },
      { res_id, id, hotel_code }
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Account updated successfully.",
    };
  }

  // balance transfer
  public async balanceTransfer(req: Request) {
    const { id, res_id, hotel_code } = req.rest_user;

    const { from_account, to_account, pay_amount } = req.body;

    // check account

    const accModel = this.Model.accountModel();
    console.log({ res_id, hotel_code, from_account, to_account }, "rest id");
    // check from account
    const checkFromAcc = await accModel.getSingleAccount({
      hotel_code,
      res_id,
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
    const checkToAcc = await accModel.getSingleAccount({
      hotel_code,
      res_id,
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

    if (pay_amount > from_acc_last_balance) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Pay amount is more than accounts balance",
      };
    }

    //=========== from account step ==========//

    // get last account ledger
    const lastAL = await accModel.getLastAccountLedgerId(hotel_code);

    const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
    const year = new Date().getFullYear();

    // now insert in account ledger
    await accModel.insertAccountLedger({
      ac_tr_ac_id: from_account,
      hotel_code,
      transaction_no: `TRX-BLNC_TRNSFR-RES-${year}${ledger_id}`,
      ledger_debit_amount: pay_amount,

      ledger_details: `Balance transfer to ${to_account}, total pay amount is = ${pay_amount}`,
    });

    // now insert in account ledger
    await accModel.insertAccountLedger({
      ac_tr_ac_id: to_account,
      hotel_code,
      transaction_no: `TRX-BLNC_TRNSFR-RES-${year}${ledger_id}`,
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
export default RestaurantAccountService;
