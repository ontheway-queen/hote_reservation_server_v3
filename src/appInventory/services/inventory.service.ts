import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreateStockItemBody,
  ICreateStockPayload,
} from "../utils/interfaces/stock.interface";

class InventoryService extends AbstractServices {
  constructor() {
    super();
  }

  public async getInventoryDetailsService(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key } = req.query;

    const model = this.Model.inventoryModel();

    const { data, total } = await model.getInventoryDetails({
      key: key as string,
      limit: Number(limit),
      skip: Number(skip),
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleInventoryDetailsService(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const model = this.Model.inventoryModel();
    const data = await model.getSingleInventoryDetails({
      id: parseInt(id),
      hotel_code,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // create Stock
  public async createStock(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: hotel_admin_id } = req.hotel_admin;
      const { stock_in, stock_out, note, stock_items } =
        req.body as ICreateStockPayload;

      // Check purchase
      const PModel = this.Model.inventoryModel(trx);

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

        // const last_balance = checkAccount[0].last_balance;

        // if (last_balance < req.body.paid_amount) {
        //   return {
        //     success: false,
        //     code: this.StatusCode.HTTP_BAD_REQUEST,
        //     message: "Insufficient balance in this account for payment",
        //   };
        // }

        // get last account ledger
        // const lastAL = await Model.getLastAccountLedgerId(hotel_code);

        // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
        // const year = new Date().getFullYear();
        // // Insert account ledger
        // await Model.insertAccountLedger({
        //   ac_tr_ac_id: req.body.ac_tr_ac_id,
        //   hotel_code,
        //   transaction_no: `TRX-${year - ledger_id}`,
        //   ledger_debit_amount: req.body.paid_amount,
        //   ledger_details: `Balance Debited by Update Stock`,
        // });

        // Insert purchase
        const createdStock = await PModel.createStockIn({
          hotel_code,
          created_by: req.hotel_admin.id,
          ac_tr_ac_id: req.body.ac_tr_ac_id,
          status: "in",
          note,
          paid_amount: req.body.paid_amount,
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
              stock_id: createdStock[0].id,
              quantity: item.quantity,
            });
          }
        }
        await PModel.createStockItem(stockItemsPayload);

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
          created_by: hotel_admin_id,
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
              stock_id: createdStock[0].id,
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

    const { data, total } = await this.Model.inventoryModel().getAllStock({
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

    const data = await this.Model.inventoryModel().getSingleStock(
      parseInt(id),
      hotel_code
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateStockService(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;
    const { product_id, type, quantity } = req.body;

    const model = this.Model.inventoryModel();

    const check = await model.getSingleStock(parseInt(id), hotel_code);

    if (!check) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Stock not found",
      };
    }

    const { stock_items } = check;

    const findProduct = stock_items.find(
      (p: any) => p.product_id === product_id
    );

    if (!findProduct) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Product not found",
      };
    }

    const isInventoryExists = await model.getSingleInventoryDetails({
      hotel_code,
      product_id: findProduct.product_id,
    });

    if (!isInventoryExists) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Inventory not found",
      };
    }

    if (type === "increase") {
      await model.updateStockItems(
        { quantity: Number(findProduct.quantity) + quantity },
        { id: findProduct.id }
      );
      await model.updateInInventory(
        {
          available_quantity: isInventoryExists.available_quantity + quantity,
        },
        { product_id: findProduct.product_id }
      );
    } else {
      if (findProduct.quantity < quantity) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Stock not enough",
        };
      }

      await model.updateStockItems(
        { quantity: findProduct.quantity - quantity },
        { id: findProduct.id }
      );

      await model.updateInInventory(
        {
          available_quantity: isInventoryExists.available_quantity - quantity,
        },
        { product_id: findProduct.product_id }
      );
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Stock updated successfully",
    };
  }
}
export default InventoryService;
