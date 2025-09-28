import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IsupplierPaymentReqBody,
  IUpdateInvSupplierPayload,
} from "../../appInventory/utils/interfaces/common.inv.interface";

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

      //   checking user
      const model = this.Model.supplierModel(trx);
      const pInvModel = this.Model.purchaseInventoryModel(trx);

      const [singleSupplier] = await model.getSingleSupplier(
        supplier_id,
        hotel_code
      );

      if (!singleSupplier) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier not found with this ID",
        };
      }

      // get supplier last balance
      const lastBalance = await model.getSupplierLastBalance({
        supplier_id,
        hotel_code,
      });

      // const check account
      const accountModel = this.Model.accountModel(trx);

      const checkAccount = await accountModel.getSingleAccount({
        hotel_code,
        id: acc_id,
      });

      if (!checkAccount.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      const { acc_type } = checkAccount[0];

      // check invoice
      if (receipt_type === "invoice") {
        const checkPurchase = await pInvModel.getSinglePurchase(
          inv_id as number,
          hotel_code
        );

        if (!checkPurchase) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found with this user",
          };
        }
        const { due, grand_total, voucher_no } = checkPurchase;

        if (due == 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Already paid this invoice",
          };
        }

        const remainingBalance = due - paid_amount;
        await pInvModel.updatePurchase(
          {
            due: remainingBalance,
          },
          { id: inv_id as number }
        );

        // insert supplier payment
        await model.insertSupplierPayment({
          created_by: admin_id,
          hotel_code: hotel_code,
          debit: paid_amount,
          credit: 0,
          acc_id,
          supplier_id,
          purchase_id: inv_id as number,
          voucher_no,
          payment_date,
        });
      } else {
        // overall payment step
        const { data: allInvoiceByUser } =
          await model.getAllSupplierInvoiceBySupId({
            hotel_code,
            sup_id: supplier_id,
            due: true,
          });

        const unpaidInvoice: {
          invoice_id: number;
          grand_total: number;
          due: number;
        }[] = [];

        for (let i = 0; i < allInvoiceByUser?.length; i++) {
          if (Number(allInvoiceByUser[i].due) !== 0) {
            unpaidInvoice.push({
              invoice_id: allInvoiceByUser[i].id,
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
            await pInvModel.updatePurchase(
              { due: item.due },
              { id: item.invoice_id }
            );
          })
        );
        // insert supplier payment
        await model.insertSupplierPayment({
          created_by: admin_id,
          hotel_code: hotel_code,
          debit: paid_amount,
          credit: 0,
          acc_id,
          supplier_id,
          purchase_id: inv_id as number,
          voucher_no: "sdfhkj",
          payment_date,
        });
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
