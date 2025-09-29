import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IcreateMoneyRecieptReqBody } from "../utlis/interfaces/invoice.interface";

class MoneyRecieptService extends AbstractServices {
  constructor() {
    super();
  }

  public async getMoneyReceiptByFolio(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getMoneyReceiptByFolio({
      folio_id: Number(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
  public async getMoneyReceiptById(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getMoneyReceiptById({
      id: Number(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async createMoneyReceipt(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getMoneyReceiptById({
      id: Number(req.params.id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // public async createMoneyReceipt(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const { hotel_code, id: admin_id } = req.hotel_admin;

  //     const {
  //       acc_id,
  //       supplier_id,
  //       paid_amount,
  //       receipt_type,
  //       inv_id,
  //       remarks,
  //     } = req.body as IcreateMoneyRecieptReqBody;

  //     //   checking user
  //     const guestModel = this.Model.guestModel(trx);

  //     const checkUser = await guestModel.getSingleGuest({ id: guest_id,hotel_code });

  //     if (!checkUser.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: "Guest not found",
  //       };
  //     }

  //     let userLastBalance = 0;

  //     if (checkUser.length) {
  //       const { last_balance } = checkUser[0];

  //       userLastBalance = last_balance;
  //     }

  //     // const check account
  //     const accountModel = this.Model.accountModel(trx);

  //     const checkAccount = await accountModel.getSingleAccount({
  //       hotel_code,
  //       id: parseInt(ac_tr_ac_id),
  //     });

  //     if (!checkAccount.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: "Account not found",
  //       };
  //     }

  //     const { ac_type } = checkAccount[0];

  //     const invoiceModel = this.Model.hotelInvoiceModel(trx);
  //     // get last account ledger
  //     // const lastAL = await accountModel.getLastAccountLedgerId(hotel_code);

  //     // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
  //     // check invoice
  //     if (reciept_type === "invoice") {
  //       const checkInvoice =
  //         await invoiceModel.getSpecificInvoiceForMoneyReciept({
  //           hotel_code,
  //           invoice_id,
  //           user_id,
  //         });

  //       if (!checkInvoice.length) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_NOT_FOUND,
  //           message: "Invoice not found with this user",
  //         };
  //       }

  //       const { due, grand_total, invoice_no } = checkInvoice[0];

  //       if (due == 0) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_BAD_REQUEST,
  //           message: "Already paid this invoice",
  //         };
  //       }

  //       if (paid_amount != due) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_BAD_REQUEST,
  //           message: "Invoice due and paid amount are not same",
  //         };
  //       }

  //       // ================= update invoice ================ //

  //       const remainingBalance = due - paid_amount;
  //       await invoiceModel.updateHotelInvoice(
  //         {
  //           due: remainingBalance,
  //         },
  //         { hotel_code, id: invoice_id }
  //       );

  //       //============ insert money reciept ========= //

  //       // get last money reciept
  //       const moneyRecieptData =
  //         await invoiceModel.getAllMoneyRecieptFoLastId();

  //       const moneyRecieptNo = moneyRecieptData.length
  //         ? moneyRecieptData[0].id + 1
  //         : 1;
  //       const year = new Date().getFullYear();

  //       const moneyRecieptRes = await invoiceModel.createMoneyReciept({
  //         hotel_code,
  //         created_by: admin_id,
  //         user_id,
  //         payment_type: ac_type,
  //         total_collected_amount: paid_amount,
  //         description: `Money reciept for invoice id = ${invoice_id},Total amount ${grand_total} and Total due amount is ${remainingBalance}`,
  //         money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
  //         inv_id: invoice_id,
  //         remarks,
  //         ac_tr_ac_id,
  //       });

  //       // ================= account transaction ================= //

  //       // insert account ledger
  //       const accLedgerRes = await accountModel.insertAccountLedger({
  //         ac_tr_ac_id,
  //         hotel_code,
  //         transaction_no: invoice_no,
  //         ledger_credit_amount: paid_amount,
  //         ledger_details: `Balance has been credited by Money Reciept, Money Reciept id =${moneyRecieptRes[0]}`,
  //       });

  //       //======== insert guest ledger =============//
  //       await guestModel.insertGuestLedger({
  //         name: invoice_no,
  //         amount: paid_amount,
  //         pay_type: "credit",
  //         user_id: user_id,
  //         hotel_code,
  //         ac_tr_ac_id,
  //         acc_ledger_id: accLedgerRes[0],
  //       });

  //       // money recipet item
  //       await invoiceModel.insertMoneyRecieptItem({
  //         money_reciept_id: moneyRecieptRes[0],
  //         invoice_id,
  //       });

  //       // update money reciept
  //       await invoiceModel.updateMoneyReciept(
  //         { ac_ldg_id: accLedgerRes[0] },
  //         moneyRecieptRes[0]
  //       );
  //     } else {
  //       // overall payment step
  //       const allInvoiceByUser =
  //         await invoiceModel.getAllInvoiceForMoneyReciept({
  //           hotel_code,
  //           user_id,
  //           due_inovice: "1",
  //         });

  //       const unpaidInvoice: {
  //         invoice_id: number;
  //         grand_total: number;
  //         due: number;
  //       }[] = [];

  //       for (let i = 0; i < allInvoiceByUser?.length; i++) {
  //         if (parseFloat(allInvoiceByUser[i].due) !== 0) {
  //           unpaidInvoice.push({
  //             invoice_id: allInvoiceByUser[i].invoice_id,
  //             grand_total: allInvoiceByUser[i].grand_total,
  //             due: allInvoiceByUser[i].due,
  //           });
  //         }
  //       }

  //       if (!unpaidInvoice.length) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_NOT_FOUND,
  //           message: "No due invoice found",
  //         };
  //       }

  //       // total due amount
  //       let remainingPaidAmount = paid_amount;

  //       const paidingInvoice: {
  //         invoice_id: number;
  //         due: number;
  //       }[] = [];

  //       console.log({ unpaidInvoice });
  //       for (let i = 0; i < unpaidInvoice.length; i++) {
  //         if (remainingPaidAmount > 0) {
  //           if (paid_amount >= unpaidInvoice[i].due) {
  //             remainingPaidAmount = paid_amount - unpaidInvoice[i].due;

  //             paidingInvoice.push({
  //               invoice_id: unpaidInvoice[i].invoice_id,
  //               due: unpaidInvoice[i].due - unpaidInvoice[i].due,
  //             });
  //           } else {
  //             remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
  //             paidingInvoice.push({
  //               invoice_id: unpaidInvoice[i].invoice_id,
  //               due: unpaidInvoice[i].due - paid_amount,
  //             });
  //           }
  //         }
  //       }

  //       // =============== update invoice ==============//
  //       Promise.all(
  //         paidingInvoice.map(async (item) => {
  //           await invoiceModel.updateHotelInvoice(
  //             { due: item.due },
  //             { hotel_code, id: item.invoice_id }
  //           );
  //         })
  //       );

  //       //============ insert money reciept ========= //

  //       // get last money reciept
  //       const moneyRecieptData =
  //         await invoiceModel.getAllMoneyRecieptFoLastId();

  //       const moneyRecieptNo = moneyRecieptData.length
  //         ? moneyRecieptData[0].id + 1
  //         : 1;
  //       const year = new Date().getFullYear();

  //       const moneyRecieptRes = await invoiceModel.createMoneyReciept({
  //         hotel_code,
  //         created_by: admin_id,
  //         user_id,
  //         payment_type: ac_type,
  //         total_collected_amount: paid_amount,
  //         description: `Money reciept for overall payment,Total payment amount ${paid_amount}`,
  //         money_receipt_no: `${`MR-${year}-${moneyRecieptNo}`}`,
  //         remarks,
  //         ac_tr_ac_id,
  //       });

  //       // ================= account transaction ================= //

  //       // insert account ledger
  //       const accLedgerRes = await accountModel.insertAccountLedger({
  //         ac_tr_ac_id,
  //         hotel_code,
  //         transaction_no: `OVERALL-PAYMENT`,
  //         ledger_credit_amount: paid_amount,
  //         ledger_details: `Balance has been credited by overall Money Reciept, Money Reciept id =${moneyRecieptRes[0]}`,
  //       });

  //       //======== insert guest ledger =============//
  //       await guestModel.insertGuestLedger({
  //         name: `OVERALL-PAYMENT`,
  //         amount: paid_amount,
  //         pay_type: "credit",
  //         user_id: user_id,
  //         hotel_code,
  //         ac_tr_ac_id,
  //         acc_ledger_id: accLedgerRes[0],
  //       });

  //       // money recipet item
  //       Promise.all(
  //         paidingInvoice.map(async (item) => {
  //           await invoiceModel.insertMoneyRecieptItem({
  //             money_reciept_id: moneyRecieptRes[0],
  //             invoice_id: item.invoice_id,
  //           });
  //         })
  //       );

  //       await invoiceModel.updateMoneyReciept(
  //         { ac_ldg_id: accLedgerRes[0] },
  //         moneyRecieptRes[0]
  //       );
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: this.ResMsg.HTTP_SUCCESSFUL,
  //     };
  //   });
  // }
}

export default MoneyRecieptService;
