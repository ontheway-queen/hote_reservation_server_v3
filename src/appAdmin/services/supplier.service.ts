import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IsupplierPaymentReqBody,
  IUpdateInvSupplierPayload,
} from "../../appInventory/utils/interfaces/common.inv.interface";
import { HelperFunction } from "../utlis/library/helperFunction";
import HelperLib from "../utlis/library/helperLib";

class SupplierService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { name, phone, last_balance } = req.body;

      await this.Model.supplierModel(trx).createSupplier({
        hotel_code,
        name,
        phone,
        last_balance,
        created_by: admin_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Supplier created successfully.",
      };
    });
  }

  public async getAllSupplier(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, status } = req.query;

    const { data, total } = await this.Model.supplierModel().getAllSupplier({
      key: name as string,
      status: status as string,
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

  public async getAllSupplierPaymentById(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, from_date, to_date } = req.query;

    const { data, total } =
      await this.Model.supplierModel().getAllSupplierPaymentById({
        key: key as string,
        from_date: from_date as string,
        to_date: to_date as string,
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

  public async getAllSupplierInvoiceById(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, from_date, to_date } = req.query;

    const { data, total } =
      await this.Model.supplierModel().getAllSupplierInvoiceBySupId({
        key: key as string,
        from_date: from_date as string,
        to_date: to_date as string,
        limit: limit as string,
        skip: skip as string,
        hotel_code,
        sup_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async updateSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;
      const updatePayload = req.body as IUpdateInvSupplierPayload;

      const model = this.Model.supplierModel(trx);

      const { data } = await model.getAllSupplier({
        id: parseInt(id),
        hotel_code,
      });

      if (!data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier not found with this ID",
        };
      }

      await model.updateSupplier(parseInt(id), hotel_code, updatePayload);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Supplier updated successfully",
      };
    });
  }

  public async deleteSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;

      await this.Model.supplierModel(trx).updateSupplier(
        parseInt(id),
        hotel_code,
        {
          is_deleted: true,
        }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Supplier deleted successfully",
      };
    });
  }

  // public async supplierPayment(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const { hotel_code, id: admin_id } = req.hotel_admin;

  //     const {
  //       acc_id,
  //       supplier_id,
  //       paid_amount,
  //       receipt_type,
  //       inv_id,
  //       remarks,
  //       payment_date,
  //     } = req.body as IsupplierPaymentReqBody;

  //     const supplierModel = this.Model.supplierModel(trx);
  //     const pInvModel = this.Model.purchaseInventoryModel(trx);

  //     const [singleSupplier] = await supplierModel.getSingleSupplier(
  //       supplier_id,
  //       hotel_code
  //     );

  //     if (!singleSupplier) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: "Supplier not found with this ID",
  //       };
  //     }

  //     // const check account
  //     const accountModel = this.Model.accountModel(trx);

  //     const checkAccount = await accountModel.getSingleAccount({
  //       hotel_code,
  //       id: acc_id,
  //     });

  //     if (!checkAccount.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: "Account not found",
  //       };
  //     }

  //     const { acc_type } = checkAccount[0];

  //     // check invoice
  //     if (receipt_type === "invoice") {
  //       const checkPurchase = await pInvModel.getSinglePurchase(
  //         inv_id as number,
  //         hotel_code
  //       );

  //       if (!checkPurchase) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_NOT_FOUND,
  //           message: "Invoice not found with this user",
  //         };
  //       }
  //       const { due, grand_total, purchase_no } = checkPurchase;

  //       if (due == 0) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_BAD_REQUEST,
  //           message: "Already paid this invoice",
  //         };
  //       }

  //       const remainingBalance = due - paid_amount;
  //       await pInvModel.updatePurchase(
  //         {
  //           due: remainingBalance,
  //         },
  //         { id: inv_id as number }
  //       );

  //       const helper = new HelperFunction();
  //       const hotelModel = this.Model.HotelModel(trx);

  //       const heads = await hotelModel.getHotelAccConfig(hotel_code, [
  //         "ACCOUNT_PAYABLE_HEAD_ID",
  //       ]);

  //       const payable_head = heads.find(
  //         (h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID"
  //       );

  //       if (!payable_head) {
  //         throw new Error(
  //           "ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel"
  //         );
  //       }

  //       const accountModel = this.Model.accountModel(trx);

  //       const voucher_no1 = await helper.generateVoucherNo("JV", trx);
  //       const created_by = req.hotel_admin.id;
  //       const today = new Date().toISOString();

  //       await accountModel.insertAccVoucher([
  //         {
  //           acc_head_id: payable_head.head_id,
  //           created_by,
  //           debit: paid_amount,
  //           credit: 0,
  //           description: `Payable decreasing for payment ${purchase_no}`,
  //           voucher_date: today,
  //           voucher_no: voucher_no1,
  //           hotel_code,
  //         },
  //       ]);

  //       if (paid_amount > 0) {
  //         const [acc] = await accountModel.getSingleAccount({
  //           hotel_code,
  //           id: acc_id,
  //         });

  //         if (!acc) throw new Error("Invalid Account");

  //         let voucher_type: "CCV" | "BCV" = "CCV";

  //         if (acc.acc_type === "BANK") {
  //           voucher_type = "BCV";
  //         }

  //         const voucher_no = await helper.generateVoucherNo(voucher_type, trx);

  //         await accountModel.insertAccVoucher([
  //           {
  //             acc_head_id: acc.acc_head_id,
  //             created_by,
  //             debit: 0,
  //             credit: paid_amount,
  //             description: `Payment given for due balance of purchase ${purchase_no}`,
  //             voucher_date: today,
  //             voucher_no,
  //             hotel_code,
  //           },
  //         ]);

  //         // insert supplier payment
  //         const [supplierPaymentID] = await supplierModel.insertSupplierPayment(
  //           {
  //             created_by: admin_id,
  //             hotel_code: hotel_code,
  //             debit: paid_amount,
  //             credit: 0,
  //             acc_id,
  //             supplier_id,
  //             purchase_id: inv_id as number,
  //             voucher_no,
  //             payment_date: new Date().toISOString(),
  //           }
  //         );
  //       }
  //     } else {
  //       // overall payment step
  //       const { data: allInvoiceByUser } =
  //         await supplierModel.getAllSupplierInvoiceBySupId({
  //           hotel_code,
  //           sup_id: supplier_id,
  //           due: true,
  //         });

  //       const unpaidInvoice: {
  //         invoice_id: number;
  //         grand_total: number;
  //         due: number;
  //       }[] = [];

  //       for (let i = 0; i < allInvoiceByUser?.length; i++) {
  //         if (Number(allInvoiceByUser[i].due) !== 0) {
  //           unpaidInvoice.push({
  //             invoice_id: allInvoiceByUser[i].id,
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
  //           await pInvModel.updatePurchase(
  //             { due: item.due },
  //             { id: item.invoice_id }
  //           );
  //         })
  //       );

  //       //___________________ ACCOUNTING PART ___________________//
  //       const helper = new HelperFunction();
  //       const hotelModel = this.Model.HotelModel(trx);
  //       const heads = await hotelModel.getHotelAccConfig(hotel_code, [
  //         "ACCOUNT_PAYABLE_HEAD_ID",
  //       ]);
  //       const payable_head = heads.find(
  //         (h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID"
  //       );
  //       if (!payable_head) {
  //         throw new Error(
  //           "ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel"
  //         );
  //       }
  //       const accountModel = this.Model.accountModel(trx);
  //       const voucher_no1 = await helper.generateVoucherNo("JV", trx);
  //       const created_by = req.hotel_admin.id;
  //       const today = new Date().toISOString();

  //       await accountModel.insertAccVoucher([
  //         {
  //           acc_head_id: payable_head.head_id,
  //           created_by,
  //           debit: paid_amount,
  //           credit: 0,
  //           description: `Payable decreasing for payment`,
  //           voucher_date: today,
  //           voucher_no: voucher_no1,
  //           hotel_code,
  //         },
  //       ]);

  //       if (paid_amount > 0) {
  //         const [acc] = await accountModel.getSingleAccount({
  //           hotel_code,
  //           id: acc_id,
  //         });
  //         if (!acc) throw new Error("Invalid Account");
  //         let voucher_type: "CCV" | "BCV" = "CCV";
  //         if (acc.acc_type === "BANK") {
  //           voucher_type = "BCV";
  //         }
  //         const voucher_no = await helper.generateVoucherNo(voucher_type, trx);
  //         await accountModel.insertAccVoucher([
  //           {
  //             acc_head_id: acc.acc_head_id,
  //             created_by,
  //             debit: 0,
  //             credit: paid_amount,
  //             description: `Payment given for due balance of supplier ${singleSupplier.name}`,
  //             voucher_date: today,
  //             voucher_no,
  //             hotel_code,
  //           },
  //         ]);
  //         // insert supplier payment
  //         const [supplierPaymentID] = await supplierModel.insertSupplierPayment(
  //           {
  //             created_by: admin_id,
  //             hotel_code: hotel_code,
  //             debit: paid_amount,
  //             credit: 0,
  //             acc_id,
  //             supplier_id,
  //             voucher_no,
  //             payment_date: new Date().toISOString(),
  //           }
  //         );

  //         const paymentAllocatinPayload = paidingInvoice.map((item) => ({
  //           invoice_id: item.invoice_id,
  //           supplier_payment_id: supplierPaymentID.id,
  //           paid_amount: item.due,
  //         }));

  //         // supplier payment allocation
  //         await supplierModel.insertSupplierPaymentAllocation(
  //           paymentAllocatinPayload
  //         );
  //       }
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: this.ResMsg.HTTP_SUCCESSFUL,
  //     };
  //   });
  // }

  public async supplierPayment(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const {
        acc_id,
        supplier_id,
        paid_amount,
        receipt_type,
        inv_id,
        remarks,
        payment_date,
      } = req.body as IsupplierPaymentReqBody;

      const supplierModel = this.Model.supplierModel(trx);
      const pInvModel = this.Model.purchaseInventoryModel(trx);
      const accountModel = this.Model.accountModel(trx);
      const hotelModel = this.Model.HotelModel(trx);
      const helper = new HelperFunction();

      // ---------- validate supplier ----------
      const [singleSupplier] = await supplierModel.getSingleSupplier(
        supplier_id,
        hotel_code
      );
      if (!singleSupplier) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier not found",
        };
      }

      // ---------- validate account ----------
      const [account] = await accountModel.getSingleAccount({
        hotel_code,
        id: acc_id,
      });
      if (!account) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      // ---------- get payable head ----------
      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "ACCOUNT_PAYABLE_HEAD_ID",
      ]);

      const payable_head = heads.find(
        (h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID"
      );
      if (!payable_head)
        throw new Error(
          "ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel"
        );

      const created_by = admin_id;
      const today = new Date().toISOString();

      // ================= Helper functions =================
      const insertPayableVoucher = async (
        amount: number,
        description: string
      ) => {
        const voucher_no = await helper.generateVoucherNo("JV", trx);
        await accountModel.insertAccVoucher([
          {
            acc_head_id: payable_head.head_id,
            created_by,
            debit: amount,
            credit: 0,
            description,
            voucher_date: today,
            voucher_no,
            hotel_code,
          },
        ]);
        return voucher_no;
      };

      const insertPaymentVoucher = async (
        amount: number,
        description: string
      ) => {
        let voucher_type: "CCV" | "BCV" =
          account.acc_type === "BANK" ? "BCV" : "CCV";
        const voucher_no = await helper.generateVoucherNo(voucher_type, trx);
        await accountModel.insertAccVoucher([
          {
            acc_head_id: account.acc_head_id,
            created_by,
            debit: 0,
            credit: amount,
            description,
            voucher_date: today,
            voucher_no,
            hotel_code,
          },
        ]);
        return voucher_no;
      };

      const trx_no1 = await new HelperLib(trx).generateSupplierTransactionNo(
        hotel_code
      );
      const [st] = await supplierModel.insertSupplierTransaction({
        hotel_code,
        supplier_id,
        transaction_no: trx_no1,
        credit: paid_amount,
        debit: 0,
        remarks: `For supplier payment. Payment Type ${receipt_type}`,
      });

      const insertSupplierPayment = async (
        amount: number,
        supplier_id: number,
        acc_id: number,
        voucher_no: string,
        purchase_id?: number
      ) => {
        const [payment] = await supplierModel.insertSupplierPayment({
          created_by,
          hotel_code,
          debit: amount,
          credit: 0,
          acc_id,
          supplier_id,
          purchase_id,
          voucher_no,
          payment_date: payment_date || today,
          remarks,
          trx_id: st.id,
        });
        return payment.id;
      };

      // ================== CASE 1: Invoice-wise payment ==================
      if (receipt_type === "invoice") {
        const checkPurchase = await pInvModel.getSinglePurchase(
          inv_id as number,
          hotel_code
        );
        if (!checkPurchase) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found",
          };
        }
        const { due, purchase_no } = checkPurchase;

        if (due <= 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Already paid",
          };
        }

        const remainingBalance = due - paid_amount;
        await pInvModel.updatePurchase(
          { due: remainingBalance },
          { id: inv_id as number }
        );

        await insertPayableVoucher(
          paid_amount,
          `Payable decreased for invoice ${purchase_no}`
        );
        const voucher_no = await insertPaymentVoucher(
          paid_amount,
          `Payment for purchase ${purchase_no}`
        );
        await insertSupplierPayment(
          paid_amount,
          supplier_id,
          acc_id,
          voucher_no,
          inv_id as number
        );
      }

      // ================== CASE 2: Overall payment ==================
      else {
        const { data: allInvoice } =
          await supplierModel.getAllSupplierInvoiceBySupId({
            hotel_code,
            sup_id: supplier_id,
            due: true,
          });

        const unpaidInvoice = allInvoice.filter((inv) => Number(inv.due) > 0);

        if (!unpaidInvoice.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No due invoice found",
          };
        }

        let remainingPaid = paid_amount;
        const paidingInvoice: {
          invoice_id: number;
          paid_amount: number;
          new_due: number;
        }[] = [];

        for (const inv of unpaidInvoice) {
          if (remainingPaid <= 0) break;
          const payAmount = Math.min(inv.due, remainingPaid);
          remainingPaid -= payAmount;
          paidingInvoice.push({
            invoice_id: inv.id,
            paid_amount: payAmount,
            new_due: inv.due - payAmount,
          });
        }

        // update invoices
        for (const item of paidingInvoice) {
          await pInvModel.updatePurchase(
            { due: item.new_due },
            { id: item.invoice_id }
          );
        }

        await insertPayableVoucher(
          paid_amount,
          `Payable decreased for supplier ${singleSupplier.name}`
        );
        const voucher_no = await insertPaymentVoucher(
          paid_amount,
          `Supplier payment to ${singleSupplier.name}`
        );
        const supplierPaymentID = await insertSupplierPayment(
          paid_amount,
          supplier_id,
          acc_id,
          voucher_no
        );

        // payment allocation
        const allocationPayload = paidingInvoice.map((item) => ({
          invoice_id: item.invoice_id,
          supplier_payment_id: supplierPaymentID,
          paid_amount: item.paid_amount,
        }));
        await supplierModel.insertSupplierPaymentAllocation(allocationPayload);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getAllSupplierPayment(req: Request) {
    const { key, from_date, to_date, limit, skip } = req.query;

    const { data, total } =
      await this.Model.supplierModel().getAllSupplierPayment({
        key: key as string,
        from_date: from_date as string,
        to_date: to_date as string,
        limit: limit as string,
        skip: skip as string,
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }
}
export default SupplierService;
