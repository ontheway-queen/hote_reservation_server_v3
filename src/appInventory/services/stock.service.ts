import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreateStockItemBody,
  ICreateStockPayload,
} from "../utils/interfaces/stock.interface";

class StockInvService extends AbstractServices {
  constructor() {
    super();
  }

  // create Stock

  public async createStock(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { stock_in, stock_out, note, stock_items } =
        req.body as ICreateStockPayload;

      // Check purchase
      const PModel = this.Model.stockInventoryModel(trx);

      if (stock_in) {
        // Check account
        const Model = this.Model.accountModel(trx);

        const checkAccount = await Model.getSingleAccount({
          hotel_code,
          id: req.body.ac_tr_ac_id,
        });
        if (!checkAccount.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Account not found",
          };
        }

        const last_balance = checkAccount[0].last_balance;

        if (last_balance < req.body.paid_amount) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Insufficient balance in this account for payment",
          };
        }

        // get last account ledger
        const lastAL = await Model.getLastAccountLedgerId(hotel_code);

        const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
        const year = new Date().getFullYear();
        // Insert account ledger
        await Model.insertAccountLedger({
          ac_tr_ac_id: req.body.ac_tr_ac_id,
          hotel_code,
          transaction_no: `TRX-${year - ledger_id}`,
          ledger_debit_amount: req.body.paid_amount,
          ledger_details: `Balance Debited by Update Stock`,
        });

        // Insert purchase
        const createdStock = await PModel.createStockIn({
          hotel_code,

          ac_tr_ac_id: req.body.ac_tr_ac_id,
          status: "in",
          note,
          paid_amount: req.body.paid_amount,
        });

        console.log(req.body);

        // Insert purchase item
        const stockItemsPayload: ICreateStockItemBody[] = [];

        for (const item of stock_items) {
          const existingItem = stockItemsPayload.find(
            (p) => p.product_id === item.product_id
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            stockItemsPayload.push({
              product_id: item.product_id,
              stock_id: createdStock[0],
              quantity: item.quantity,
            });
          }
        }
        await PModel.createStockItem(stockItemsPayload);

        console.log({ stockItemsPayload });

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
        const purchase_product_ids = stock_items.map((item) => item.product_id);

        const getInventoryProduct = await PModel.getAllInventory({
          hotel_code,
          product_id: purchase_product_ids,
        });

        for (const payloadItem of stockItemsPayload) {
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
          await PModel.insertInInventory(addedInventoryProduct);
        }

        // console.log({ modifyInventoryProduct });
        console.log({ modifyInventoryProduct });
        if (modifyInventoryProduct.length) {
          await Promise.all(
            modifyInventoryProduct.map(async (item) => {
              await PModel.updateInInventory(
                { available_quantity: item.available_quantity },
                { id: item.id }
              );
            })
          );
        }
      }

      if (stock_out) {
        // Insert purchase
        const createdStock = await PModel.createStockOut({
          hotel_code,
          note,
          status: "out",
        });

        // Insert purchase item
        const stockItemsPayload: ICreateStockItemBody[] = [];

        for (const item of stock_items) {
          const existingItem = stockItemsPayload.find(
            (p) => p.product_id === item.product_id
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            stockItemsPayload.push({
              product_id: item.product_id,
              stock_id: createdStock[0],
              quantity: item.quantity,
            });
          }
        }
        await PModel.createStockItem(stockItemsPayload);

        // Inventory step
        const modifyInventoryProduct: {
          id: number;
          available_quantity: number;
          quantity_used: number;
        }[] = [];

        const purchase_product_ids = stock_items.map((item) => item.product_id);

        const getInventoryProduct = await PModel.getAllInventory({
          hotel_code,
          product_id: purchase_product_ids,
        });

        for (const payloadItem of stockItemsPayload) {
          const inventoryItem = getInventoryProduct.find(
            (g) => g.product_id === payloadItem.product_id
          );
          if (inventoryItem) {
            modifyInventoryProduct.push({
              available_quantity:
                parseFloat(inventoryItem.available_quantity) -
                payloadItem.quantity,
              quantity_used:
                parseFloat(inventoryItem.quantity_used) + payloadItem.quantity,
              id: inventoryItem.id,
            });
          }
        }

        if (modifyInventoryProduct.length) {
          await Promise.all(
            modifyInventoryProduct.map(async (item) => {
              await PModel.updateInInventory(
                {
                  available_quantity: item.available_quantity,
                  quantity_used: item.quantity_used,
                },
                { id: item.id }
              );
            })
          );
        }
        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: "Stock Out successfully.",
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Stock In successfully.",
      };
    });
  }

  // Get all Stock
  public async getAllStock(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, status } = req.query;

    const model = this.Model.stockInventoryModel();

    const { data, total } = await model.getAllStock({
      key: key as string,
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

  // Get Single Stock
  public async getSingleStock(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.stockInventoryModel().getSingleStock(
      parseInt(id),
      hotel_code
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
export default StockInvService;
