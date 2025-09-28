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
      const supplierModel = this.Model.supplierModel(trx);

      // Check account
      const accModel = this.Model.accountModel(trx);

      // Check purchase
      const pInvModel = this.Model.purchaseInventoryModel(trx);
      const pdModel = this.Model.inventoryModel(trx);

      const checkSupplier = await supplierModel.getSingleSupplier(
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

      if (paid_amount > 0) {
        // insert supplier payment
        const [supplierPaymentID] = await supplierModel.insertSupplierPayment({
          created_by: admin_id,
          hotel_code: hotel_code,
          debit: paid_amount,
          credit: 0,
          acc_id: ac_tr_ac_id,
          supplier_id,
          purchase_id: createdPurchase[0].id,
          voucher_no: p_voucher_no,
          payment_date: new Date().toISOString(),
        });
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

  public async getMoneyReceiptByPurchaseId(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getMoneyReceiptByPurchaseId({
        id: Number(req.params.id),
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
export default PurchaseInvService;
