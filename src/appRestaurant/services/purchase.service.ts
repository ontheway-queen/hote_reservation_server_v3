import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreatePurchaseBody,
  ICreatePurchaseItemPayload,
} from "../utils/interfaces/purchase.interface";

class PurchaseService extends AbstractServices {
  constructor() {
    super();
  }

  // create purchase
  public async createPurchase(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { res_id, id: res_admin, name, hotel_code } = req.rest_user;
      const {
        purchase_items,
        purchase_date,
        supplier_id,
        ac_tr_ac_id,
        discount_amount,
      } = req.body as ICreatePurchaseBody;

      // Check account
      const model = this.Model.restaurantModel(trx);
      const accModel = this.Model.accountModel(trx);

      const checkSupplier = await this.Model.CommonInventoryModel(
        trx
      ).getSingleSupplier(supplier_id, hotel_code);

      console.log(req.body, res_id);

      console.log({ checkSupplier });

      if (!checkSupplier.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Invalid Supplier Information",
        };
      }
      const checkAccount = await accModel.getSingleAccount({
        res_id,
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

      const last_balance = checkAccount[0].last_balance;

      const sub_total = purchase_items.reduce((acc: any, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);

      const grand_total = sub_total - discount_amount;

      if (last_balance < grand_total) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Insufficient balance in this account for payment",
        };
      }

      if (discount_amount > grand_total) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Discount amount cannot be greater than grand total",
        };
      }

      const year = new Date().getFullYear();

      //   insert purchase
      const createdPurchase = await model.createPurchase({
        res_id,
        purchase_date,
        supplier_id,
        ac_tr_ac_id,
        sub_total,
        discount_amount,
        grand_total,
      });

      const purchaseId = createdPurchase[0];

      const purchaseItemsPayload: ICreatePurchaseItemPayload[] = [];

      console.log({ purchase_items });

      for (let i = 0; i < purchase_items.length; i++) {
        let found = false;

        for (let j = 0; j < purchaseItemsPayload.length; j++) {
          if (
            purchase_items[i].ingredient_id ==
            purchaseItemsPayload[j].ingredient_id
          ) {
            found = true;
            purchaseItemsPayload[j].quantity += purchase_items[i].quantity;
            purchaseItemsPayload[j].price +=
              purchase_items[i].price * purchase_items[i].quantity;
            break;
          }
        }

        console.log({ purchaseItemsPayload });

        if (!found) {
          purchaseItemsPayload.push({
            ingredient_id: purchase_items[i].ingredient_id,
            name: purchase_items[i].name,
            purchase_id: purchaseId,
            price: purchase_items[i].price * purchase_items[i].quantity,
            quantity: purchase_items[i].quantity,
          });
        }
      }

      //   insert purchase item
      await model.createPurchaseItem(purchaseItemsPayload);

      // =================== inventory step =================//

      const modifyInventoryIngredient: {
        id: number;
        available_quantity: number;
      }[] = [];

      const addedInventoryIngredient: {
        res_id: number;
        ing_id: number;
        available_quantity: number;
      }[] = [];

      const purchase_ing_ids = purchase_items.map((item) => item.ingredient_id);

      const getInventoryIngredient = await model.getAllInventory({
        res_id,
        ing_ids: purchase_ing_ids,
      });

      console.log({ getInventoryIngredient });
      for (let i = 0; i < purchaseItemsPayload.length; i++) {
        let found = false;
        for (let j = 0; j < getInventoryIngredient?.length; j++) {
          if (
            purchaseItemsPayload[i].ingredient_id ==
            getInventoryIngredient[j].ing_id
          ) {
            found = true;
            modifyInventoryIngredient.push({
              available_quantity:
                parseFloat(getInventoryIngredient[j].available_quantity) +
                purchaseItemsPayload[i].quantity,
              id: getInventoryIngredient[j].id,
            });
            break;
          }
        }
        if (!found) {
          addedInventoryIngredient.push({
            res_id,
            available_quantity: purchaseItemsPayload[i].quantity,
            ing_id: purchaseItemsPayload[i].ingredient_id,
          });
        }
      }

      // insert in inventory
      if (addedInventoryIngredient.length) {
        await model.insertInInventory(addedInventoryIngredient);
      }
      // get last acc ledger id
      const lastAL = await accModel.getLastAccountLedgerId(hotel_code);

      const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;

      // Insert account ledger
      const accLedgerRes = await accModel.insertAccountLedger({
        ac_tr_ac_id,
        hotel_code,
        transaction_no: `TRX-RESTURANT-PUR-${year}${acc_ledger_id}`,
        ledger_debit_amount: grand_total,
        ledger_details: `Balance Debited by Purchase`,
      });

      const pInvModel = this.Model.purchaseInventoryModel(trx);
      const cmnInvModel = this.Model.CommonInventoryModel(trx);
      // Insert supplier ledger
      await pInvModel.insertInvSupplierLedger({
        ac_tr_ac_id,
        supplier_id,
        hotel_code,
        res_id,
        acc_ledger_id: accLedgerRes[0],
        ledger_credit_amount: grand_total,
        ledger_details: `Balance credited for sell something`,
      });

      // insert in payment supplier
      await cmnInvModel.insertSupplierPayment({
        ac_tr_ac_id,
        created_by: res_admin,
        hotel_code: hotel_code,
        purchase_id: purchaseId,
        total_paid_amount: grand_total,
        supplier_id,
        res_id,
      });

      if (modifyInventoryIngredient.length) {
        await Promise.all(
          modifyInventoryIngredient.map(async (item) => {
            await model.updateInInventory(
              { available_quantity: item.available_quantity },
              { id: item.id }
            );
          })
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Purchase created successfully.",
      };
    });
  }

  // Get all Purchase
  public async getAllPurchase(req: Request) {
    const { res_id } = req.rest_user;
    const { limit, skip } = req.query;

    const model = this.Model.restaurantModel();

    const { data, total } = await model.getAllpurchase({
      limit: limit as string,
      skip: skip as string,
      res_id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Get Single Purchase
  public async getSinglePurchase(req: Request) {
    const { id } = req.params;
    const { res_id } = req.rest_user;

    const data = await this.Model.restaurantModel().getSinglePurchase(
      parseInt(id),
      res_id
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

  // Get all Account
  public async getAllAccount(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { ac_type, key, status, limit, skip, admin_id } = req.query;

    // model
    const model = this.Model.accountModel();

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
}
export default PurchaseService;
