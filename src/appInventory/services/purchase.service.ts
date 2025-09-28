import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreateInvPurchaseItemBody,
  ICreateInvPurchasePayload,
} from "../utils/interfaces/purchase.interface";
import HelperLib from "../../appAdmin/utlis/library/helperLib";

class PurchaseInvService extends AbstractServices {
  constructor() {
    super();
  }

  public async createPurchase(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const {
        purchase_date,
        supplier_id,
        ac_tr_ac_id,
        discount_amount,
        vat,
        shipping_cost,
        paid_amount,
        purchase_items,
      } = req.body as ICreateInvPurchasePayload;

      // Check supplier
      const cmnInvModel = this.Model.CommonInventoryModel(trx);

      // Check account
      const accModel = this.Model.accountModel(trx);

      // Check purchase
      const pInvModel = this.Model.purchaseInventoryModel(trx);
      const pdModel = this.Model.productInventoryModel(trx);

      const checkSupplier = await cmnInvModel.getSingleSupplier(
        supplier_id,
        hotel_code
      );
      if (!checkSupplier.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier not found",
        };
      }

      const checkAccount = await accModel.getSingleAccount({
        hotel_code,
        id: ac_tr_ac_id,
      });

      if (!checkAccount.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      // check purchase item exist or not
      const pdIds = purchase_items.map((item) => item.product_id);

      const { data: checkPd } = await pdModel.getAllProduct({
        pd_ids: pdIds,
        hotel_code,
      });

      if (pdIds.length != checkPd.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Product id is invalid",
        };
      }
      // const last_balance = checkAccount[0].last_balance;
      const sub_total = purchase_items.reduce(
        (acc, curr) => acc + curr.quantity * curr.price,
        0
      );

      const grand_total = parseFloat(
        Number.parseFloat(
          (sub_total + vat + shipping_cost - discount_amount).toString()
        ).toFixed(2)
      );

      const due = grand_total - paid_amount;

      if (paid_amount > grand_total) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Paid Amount cannot be greater than grand total",
        };
      }

      if (discount_amount > grand_total) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Discount amount cannot be greater than grand total",
        };
      }

      const p_voucher_no = await new HelperLib(trx).generatePurchaseVoucher();

      // Insert purchase
      const createdPurchase = await pInvModel.createPurchase({
        hotel_code,
        purchase_date,
        supplier_id,
        discount_amount,
        sub_total,
        grand_total,
        paid_amount,
        vat,
        shipping_cost,
        due,
        voucher_no: p_voucher_no,
      });

      // Insert purchase item
      const purchaseItemsPayload: ICreateInvPurchaseItemBody[] = [];

      for (const item of purchase_items) {
        const existingItem = purchaseItemsPayload.find(
          (p) => p.product_id === item.product_id
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.price += item.price * item.quantity;
        } else {
          purchaseItemsPayload.push({
            product_id: item.product_id,
            purchase_id: createdPurchase[0].id,
            price: item.price * item.quantity,
            quantity: item.quantity,
            product_name: item.product_name,
          });
        }
      }

      await pInvModel.createPurchaseItem(purchaseItemsPayload);

      // Inventory step
      const modifyInventoryProduct: {
        id: number;
        available_quantity: number;
      }[] = [];

      const addedInventoryProduct: {
        hotel_code: number;
        product_id: number;
        available_quantity: number;
      }[] = [];

      const purchase_product_ids = purchase_items.map(
        (item) => item.product_id
      );

      const getInventoryProduct = await pInvModel.getAllInventory({
        hotel_code,
        product_id: purchase_product_ids,
      });

      for (const payloadItem of purchaseItemsPayload) {
        const inventoryItem = getInventoryProduct.find(
          (g) => g.product_id === payloadItem.product_id
        );
        if (inventoryItem) {
          modifyInventoryProduct.push({
            available_quantity:
              parseFloat(inventoryItem.available_quantity) +
              payloadItem.quantity,
            id: inventoryItem.id,
          });
        } else {
          addedInventoryProduct.push({
            hotel_code,
            available_quantity: payloadItem.quantity,
            product_id: payloadItem.product_id,
          });
        }
      }
      // Insert in inventory
      if (addedInventoryProduct.length) {
        await pInvModel.insertInInventory(addedInventoryProduct);
      }

      if (modifyInventoryProduct.length) {
        await Promise.all(
          modifyInventoryProduct.map(async (item) => {
            await pInvModel.updateInInventory(
              { available_quantity: item.available_quantity },
              { id: item.id }
            );
          })
        );
      }

      //   invoice and money receipt generate
      const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);

      const invoiceRes = await hotelInvoiceModel.insertInInvoice({
        hotel_code,
        invoice_date: new Date().toISOString(),
        invoice_number: p_voucher_no,
        total_amount: grand_total,
        notes: `Purchase from ${checkSupplier[0].supplier_name}`,
      });

      //   insert in invoice items
      const invoiceItemPayload = purchaseItemsPayload.map((item) => ({
        inv_id: invoiceRes[0].id,
        name: item.product_name,
        quantity: item.quantity,
        total_price: item.price,
      }));

      await hotelInvoiceModel.insertInInvoiceItems(invoiceItemPayload);

      // insert in purchase sub invoice
      await hotelInvoiceModel.insertInPurchaseSubInvoice({
        inv_id: invoiceRes[0].id,
        purchase_id: createdPurchase[0].id,
        sup_id: supplier_id,
      });

      if (paid_amount > 0) {
        const [mr] = await hotelInvoiceModel.insertMoneyReceipt({
          hotel_code,
          receipt_no: p_voucher_no,
          receipt_date: new Date().toISOString(),
          amount_paid: paid_amount,
          acc_id: ac_tr_ac_id,
          payment_method: checkAccount[0].acc_type,
          received_by: admin_id,
          notes: `Payment for purchase invoice no ${p_voucher_no}`,
          voucher_no: p_voucher_no,
        });

        await hotelInvoiceModel.insertMoneyReceiptItem({
          money_receipt_id: mr.id,
          invoice_id: invoiceRes[0].id,
          paid_amount: paid_amount,
        });

        // insert supplier payment
        const [supplierPaymentID] = await cmnInvModel.insertSupplierPayment({
          created_by: admin_id,
          hotel_code: hotel_code,
          debit: paid_amount,
          credit: 0,
          acc_id: ac_tr_ac_id,
          supplier_id,
        });

        // supplier payment allocation
        await cmnInvModel.insertSupplierPaymentAllocation([
          {
            supplier_payment_id: supplierPaymentID.id,
            invoice_id: invoiceRes[0].id,
            paid_amount,
          },
        ]);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Purchase created successfully.",
      };
    });
  }

  public async getAllPurchase(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, supplier_id, due } = req.query;

    const model = this.Model.purchaseInventoryModel();

    const { data, total } = await model.getAllpurchase({
      key: key as string,
      limit: limit as string,
      skip: skip as string,
      by_supplier_id: parseInt(supplier_id as string),
      hotel_code,
      due: parseInt(due as string),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSinglePurchase(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.purchaseInventoryModel().getSinglePurchase(
      parseInt(id),
      hotel_code
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getInvoiceByPurchaseId(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;
    console.log({ id });
    const data =
      await this.Model.purchaseInventoryModel().getInvoiceByPurchaseId(
        parseInt(id),
        hotel_code
      );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getMoneyReceiptById(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getPurchaseMoneyReceiptById({
        id: Number(req.params.id),
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async createPurchaseMoneyReciept(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;

      const {
        ac_tr_ac_id,
        supplier_id,
        paid_amount,
        reciept_type,
        purchase_id,
        remarks,
      } = req.body;

      //   checking supplier
      const cmnInvModel = this.Model.CommonInventoryModel(trx);

      // Check account
      const accModel = this.Model.accountModel(trx);

      // Check purchase
      const pInvModel = this.Model.purchaseInventoryModel(trx);

      const checkSupplier = await cmnInvModel.getSingleSupplier(
        supplier_id,
        hotel_code
      );
      if (!checkSupplier.length) {
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

      // check invoice
      if (reciept_type === "invoice") {
        const checkSinglePurchase = await pInvModel.getSinglePurchase(
          purchase_id,
          hotel_code
        );

        console.log({ checkSinglePurchase });

        if (!checkSinglePurchase) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found with this user",
          };
        }

        const { due, grand_total, voucher_no, supplier_id } =
          checkSinglePurchase;
        console.log({ checkSinglePurchase });

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

        // get last account ledger
        const lastAL = await accountModel.getLastAccountLedgerId(hotel_code);

        const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
        const year = new Date().getFullYear();
        // Insert account ledger
        const ledgerRes = await accModel.insertAccountLedger({
          ac_tr_ac_id,
          hotel_code,
          transaction_no: `TRX-${year - ledger_id}`,
          ledger_debit_amount: paid_amount,
          ledger_details: `Balance Debited by Purchase`,
        });

        // ================= update purchase ================ //

        const remainingBalance = due - paid_amount;

        await pInvModel.updatePurchase(
          {
            due: remainingBalance,
          },
          { id: purchase_id }
        );

        // insert in payment supplier
        await cmnInvModel.insertSupplierPayment({
          acc_id: ac_tr_ac_id,
          created_by: admin_id,
          hotel_code: hotel_code,
          debit: paid_amount,
          credit: 0,
          // voucher_no: purchase_id,
          supplier_id,
        });
      } else {
        // overall payment step
        const { data: allPurchaseInvoiceByUser } =
          await pInvModel.getAllpurchase({
            hotel_code,
            by_supplier_id: supplier_id,
          });

        const unpaidInvoice: {
          id: number;
          grand_total: number;
          due: number;
          voucher_no: string;
        }[] = [];

        for (let i = 0; i < allPurchaseInvoiceByUser?.length; i++) {
          if (parseFloat(allPurchaseInvoiceByUser[i].due) !== 0) {
            unpaidInvoice.push({
              id: allPurchaseInvoiceByUser[i].id,
              grand_total: allPurchaseInvoiceByUser[i].grand_total,
              due: allPurchaseInvoiceByUser[i].due,
              voucher_no: allPurchaseInvoiceByUser[i].voucher_no,
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
          id: number;
          due: number;
          purchase_id: string;
          total_paid_amount: number;
        }[] = [];

        console.log({ unpaidInvoice });

        for (let i = 0; i < unpaidInvoice.length; i++) {
          if (remainingPaidAmount > 0) {
            if (paid_amount >= unpaidInvoice[i].due) {
              remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
              paidingInvoice.push({
                id: unpaidInvoice[i].id,
                due: unpaidInvoice[i].due - unpaidInvoice[i].due,
                purchase_id,
                total_paid_amount: unpaidInvoice[i].due,
              });
            } else {
              remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
              paidingInvoice.push({
                id: unpaidInvoice[i].id,
                due: unpaidInvoice[i].due - paid_amount,

                purchase_id,
                total_paid_amount: unpaidInvoice[i].due - paid_amount,
              });
            }
          }
        }

        // =============== update purchase ==============//
        await Promise.all(
          paidingInvoice.map(async (item) => {
            await pInvModel.updatePurchase({ due: item.due }, { id: item.id });
          })
        );

        const year = new Date().getFullYear();
        // get last account ledger
        const lastAL = await accountModel.getLastAccountLedgerId(hotel_code);

        const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
        // Insert account ledger
        await accModel.insertAccountLedger({
          ac_tr_ac_id,
          hotel_code,
          transaction_no: `TRX-${year - ledger_id}`,
          ledger_debit_amount: paid_amount,
          ledger_details: `Balance Debited by purchase Money Reciept`,
        });

        // money recipet item
        await Promise.all(
          paidingInvoice.map(async (item) => {
            await cmnInvModel.insertSupplierPayment({
              created_by: admin_id,
              hotel_code,
              //   purchase_id: purchase_id[0],
              acc_id: ac_tr_ac_id,
              debit: item.total_paid_amount,
              credit: 0,
              //   total_paid_amount: item.total_paid_amount,
              //   ac_tr_ac_id,
              // voucher_no: "",
              supplier_id,
            });
          })
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }
}
export default PurchaseInvService;
