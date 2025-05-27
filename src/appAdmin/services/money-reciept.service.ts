import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class MoneyRecieptService extends AbstractServices {
  constructor() {
    super();
  }

  // create money reciept
  public async createMoneyReciept(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;

      const {
        ac_tr_ac_id,
        user_id,
        paid_amount,
        reciept_type,
        invoice_id,
        remarks,
      } = req.body;

      //   checking user
      const guestModel = this.Model.guestModel(trx);

      const checkUser = await guestModel.getSingleGuest({ id: user_id });
      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "User not found",
        };
      }

      let userLastBalance = 0;

      if (checkUser.length) {
        const { last_balance } = checkUser[0];

        userLastBalance = last_balance;
      }

      // const check account
      const accountModel = this.Model.accountModel(trx);

      const checkAccount = await accountModel.getSingleAccount({
        hotel_code,
        id: parseInt(ac_tr_ac_id),
      });

      if (!checkAccount.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      const { ac_type } = checkAccount[0];

      const invoiceModel = this.Model.hotelInvoiceModel(trx);
      // get last account ledger
      // const lastAL = await accountModel.getLastAccountLedgerId(hotel_code);

      // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
      // check invoice
      if (reciept_type === "invoice") {
        const checkInvoice =
          await invoiceModel.getSpecificInvoiceForMoneyReciept({
            hotel_code,
            invoice_id,
            user_id,
          });

        if (!checkInvoice.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found with this user",
          };
        }

        const { due, grand_total, invoice_no } = checkInvoice[0];

        if (due == 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Already paid this invoice",
          };
        }

        if (paid_amount != due) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Invoice due and paid amount are not same",
          };
        }

        // ================= update invoice ================ //

        const remainingBalance = due - paid_amount;
        await invoiceModel.updateHotelInvoice(
          {
            due: remainingBalance,
          },
          { hotel_code, id: invoice_id }
        );

        //============ insert money reciept ========= //

        // get last money reciept
        const moneyRecieptData =
          await invoiceModel.getAllMoneyRecieptFoLastId();

        const moneyRecieptNo = moneyRecieptData.length
          ? moneyRecieptData[0].id + 1
          : 1;
        const year = new Date().getFullYear();

        const moneyRecieptRes = await invoiceModel.createMoneyReciept({
          hotel_code,
          created_by: admin_id,
          user_id,
          payment_type: ac_type,
          total_collected_amount: paid_amount,
          description: `Money reciept for invoice id = ${invoice_id},Total amount ${grand_total} and Total due amount is ${remainingBalance}`,
          money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
          inv_id: invoice_id,
          remarks,
          ac_tr_ac_id,
        });

        // ================= account transaction ================= //

        // insert account ledger
        const accLedgerRes = await accountModel.insertAccountLedger({
          ac_tr_ac_id,
          hotel_code,
          transaction_no: invoice_no,
          ledger_credit_amount: paid_amount,
          ledger_details: `Balance has been credited by Money Reciept, Money Reciept id =${moneyRecieptRes[0]}`,
        });

        //======== insert guest ledger =============//
        await guestModel.insertGuestLedger({
          name: invoice_no,
          amount: paid_amount,
          pay_type: "credit",
          user_id: user_id,
          hotel_code,
          ac_tr_ac_id,
          acc_ledger_id: accLedgerRes[0],
        });

        // money recipet item
        await invoiceModel.insertMoneyRecieptItem({
          money_reciept_id: moneyRecieptRes[0],
          invoice_id,
        });

        // update money reciept
        await invoiceModel.updateMoneyReciept(
          { ac_ldg_id: accLedgerRes[0] },
          moneyRecieptRes[0]
        );
      } else {
        // overall payment step
        const allInvoiceByUser =
          await invoiceModel.getAllInvoiceForMoneyReciept({
            hotel_code,
            user_id,
            due_inovice: "1",
          });

        const unpaidInvoice: {
          invoice_id: number;
          grand_total: number;
          due: number;
        }[] = [];

        for (let i = 0; i < allInvoiceByUser?.length; i++) {
          if (parseFloat(allInvoiceByUser[i].due) !== 0) {
            unpaidInvoice.push({
              invoice_id: allInvoiceByUser[i].invoice_id,
              grand_total: allInvoiceByUser[i].grand_total,
              due: allInvoiceByUser[i].due,
            });
          }
        }

        if (!unpaidInvoice.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No due invoice found",
          };
        }

        // total due amount
        let remainingPaidAmount = paid_amount;

        const paidingInvoice: {
          invoice_id: number;
          due: number;
        }[] = [];

        console.log({ unpaidInvoice });
        for (let i = 0; i < unpaidInvoice.length; i++) {
          if (remainingPaidAmount > 0) {
            if (paid_amount >= unpaidInvoice[i].due) {
              remainingPaidAmount = paid_amount - unpaidInvoice[i].due;

              paidingInvoice.push({
                invoice_id: unpaidInvoice[i].invoice_id,
                due: unpaidInvoice[i].due - unpaidInvoice[i].due,
              });
            } else {
              remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
              paidingInvoice.push({
                invoice_id: unpaidInvoice[i].invoice_id,
                due: unpaidInvoice[i].due - paid_amount,
              });
            }
          }
        }

        // =============== update invoice ==============//
        Promise.all(
          paidingInvoice.map(async (item) => {
            await invoiceModel.updateHotelInvoice(
              { due: item.due },
              { hotel_code, id: item.invoice_id }
            );
          })
        );

        //============ insert money reciept ========= //

        // get last money reciept
        const moneyRecieptData =
          await invoiceModel.getAllMoneyRecieptFoLastId();

        const moneyRecieptNo = moneyRecieptData.length
          ? moneyRecieptData[0].id + 1
          : 1;
        const year = new Date().getFullYear();

        const moneyRecieptRes = await invoiceModel.createMoneyReciept({
          hotel_code,
          created_by: admin_id,
          user_id,
          payment_type: ac_type,
          total_collected_amount: paid_amount,
          description: `Money reciept for overall payment,Total payment amount ${paid_amount}`,
          money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
          remarks,
          ac_tr_ac_id,
        });

        // ================= account transaction ================= //

        // insert account ledger
        const accLedgerRes = await accountModel.insertAccountLedger({
          ac_tr_ac_id,
          hotel_code,
          transaction_no: `OVERALL-PAYMENT`,
          ledger_credit_amount: paid_amount,
          ledger_details: `Balance has been credited by overall Money Reciept, Money Reciept id =${moneyRecieptRes[0]}`,
        });

        //======== insert guest ledger =============//
        await guestModel.insertGuestLedger({
          name: `OVERALL-PAYMENT`,
          amount: paid_amount,
          pay_type: "credit",
          user_id: user_id,
          hotel_code,
          ac_tr_ac_id,
          acc_ledger_id: accLedgerRes[0],
        });

        // money recipet item
        Promise.all(
          paidingInvoice.map(async (item) => {
            await invoiceModel.insertMoneyRecieptItem({
              money_reciept_id: moneyRecieptRes[0],
              invoice_id: item.invoice_id,
            });
          })
        );

        await invoiceModel.updateMoneyReciept(
          { ac_ldg_id: accLedgerRes[0] },
          moneyRecieptRes[0]
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // get all money reciept
  public async getAllMoneyReciept(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { from_date, to_date, key, limit, skip } = req.query;

    const { data, total } =
      await this.Model.hotelInvoiceModel().getAllMoneyReciept({
        hotel_code,
        from_date: from_date as string,
        to_date: to_date as string,
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

  // get all money reciept
  public async getSingleMoneyReciept(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.hotelInvoiceModel().getSingleMoneyReciept({
      hotel_code,
      id: parseInt(req.params.id),
    });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }

  // advance return money reciept
  public async advanceReturnMoneyReciept(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { ac_tr_ac_id, user_id, return_amount, return_date, remarks } =
        req.body;

      //   checking user
      const guestModel = this.Model.guestModel(trx);

      const checkUser = await guestModel.getSingleGuest({ id: user_id });
      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "User not found",
        };
      }

      // const check account
      const accountModel = this.Model.accountModel(trx);

      const checkAccount = await accountModel.getSingleAccount({
        hotel_code,
        id: parseInt(ac_tr_ac_id),
      });

      if (!checkAccount.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      const { ac_type } = checkAccount[0];

      const { last_balance } = checkUser[0];

      if (return_amount > last_balance) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Return amount is more than users payable amount",
        };
      }

      //============ insert money reciept ========= //
      const invoiceModel = this.Model.hotelInvoiceModel(trx);

      // get last money reciept
      const moneyRecieptData = await invoiceModel.getAllMoneyRecieptFoLastId();

      const moneyRecieptNo = moneyRecieptData.length
        ? moneyRecieptData[0].id + 1
        : 1;
      const year = new Date().getFullYear();

      const moneyRecieptRes = await invoiceModel.createMoneyReciept({
        hotel_code,
        created_by: admin_id,
        user_id,
        payment_type: ac_type,
        total_collected_amount: return_amount,
        description: `Money reciept for advance return,Total return amount ${return_amount}`,
        money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
        ac_tr_ac_id,
        return_date,
        remarks,
      });

      // insert in advance return
      await invoiceModel.insertAdvanceReturn({
        hotel_code,
        remarks,
        money_reciept_id: moneyRecieptRes[0],
        return_date,
      });

      // ================= account transaction ================= //

      // insert account ledger
      const accLedgerRes = await accountModel.insertAccountLedger({
        ac_tr_ac_id,
        hotel_code,
        transaction_no: `ADVANCE-RETURN-PAYMENT`,
        ledger_debit_amount: return_amount,
        ledger_details: `Balance has been debited by Advanced Return Money Reciept, Money Reciept id =${moneyRecieptRes[0]}`,
      });

      await guestModel.insertGuestLedger({
        name: `ADVANCE-RETURN-PAYMENT`,
        amount: return_amount,
        pay_type: "credit",
        user_id: user_id,
        hotel_code,
        ac_tr_ac_id,
        acc_ledger_id: accLedgerRes[0],
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Advance money reciept created",
      };
    });
  }
  // get alladvance return money reciept
  public async getAllAdvanceReturnMoneyReciept(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { from_date, to_date, key, limit, skip } = req.query;
    const { data, total } =
      await this.Model.hotelInvoiceModel().getAllAdvanceMoneyReciept({
        hotel_code,
        from_date: from_date as string,
        to_date: to_date as string,
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

  // get single advance return money reciept
  public async getSingleAdvanceReturnMoneyReciept(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const data =
      await this.Model.hotelInvoiceModel().getSingleAdvanceMoneyReciept(
        hotel_code,
        parseInt(req.params.id)
      );

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }
}

export default MoneyRecieptService;
