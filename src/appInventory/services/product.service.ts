import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreateDamagedProductBody,
  ICreateDemagedProductPayload,
  ICreateProductPayload,
} from "../utils/interfaces/product.interface";

class ProductInvService extends AbstractServices {
  constructor() {
    super();
  }

  // Create Product

  public async createProduct(req: Request) {
    const { hotel_code, id: admin_id } = req.hotel_admin;
    const body = req.body as ICreateProductPayload;

    const model = this.Model.productInventoryModel();

    const { data } = await model.getAllProduct({
      key: body.name,
      hotel_code,
    });

    if (data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: "Product name already exists",
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length) {
      body["image"] = files[0].filename;
    }

    const year = new Date().getFullYear();

    // get last voucher ID
    const productData = await model.getAllProductsForLastId();

    const productNo = productData.length ? productData[0].id + 1 : 1;

    // Product create
    await model.createProduct({
      ...body,
      product_code: `P-${year}${productNo}`,
      hotel_code,
      created_by: admin_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Product created successfully.",
    };
  }

  // Get all Product
  public async getAllProduct(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, in_stock, unit, category, brand } = req.query;

    const model = this.Model.productInventoryModel();

    const { data, total } = await model.getAllProduct({
      key: key as string,
      unit: unit as string,
      brand: brand as string,
      category: category as string,
      in_stock: in_stock as string,
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

  // create Damaged Product
  public async createDamagedProduct(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id } = req.hotel_admin;
      const { date, damaged_items } = req.body as ICreateDamagedProductBody;

      // Check product
      const model = this.Model.productInventoryModel(trx);

      // Check inventory
      const PModel = this.Model.purchaseInventoryModel(trx);

      // Insert purchase item
      const stockItemsPayload: ICreateDemagedProductPayload[] = [];

      for (const item of damaged_items) {
        const existingItem = stockItemsPayload.find(
          (p) => p.product_id === item.product_id
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          stockItemsPayload.push({
            product_id: item.product_id,
            hotel_code,
            date: date,
            quantity: item.quantity,
            note: item.note,
            created_by: id,
          });
        }
      }
      // Insert dm product
      await model.createDamagedProduct(stockItemsPayload);

      // Inventory step
      const modifyInventoryProduct: {
        id: number;
        available_quantity: number;
        total_damaged: number;
      }[] = [];

      const purchase_product_ids = damaged_items.map((item) => item.product_id);

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
            total_damaged:
              parseFloat(inventoryItem.total_damaged) + payloadItem.quantity,
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
                total_damaged: item.total_damaged,
              },

              { id: item.id }
            );
          })
        );
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Damaged Product Created successfully.",
      };
    });
  }

  // Get all Damaged Product
  public async getAllDamagedProduct(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, status } = req.query;

    const model = this.Model.productInventoryModel();

    const { data, total } = await model.getAllDamagedProduct({
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

  // Get Single Damaged Product
  public async getSingleDamagedProduct(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data =
      await this.Model.productInventoryModel().getSingleDamagedProduct(
        parseInt(id),
        hotel_code
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
export default ProductInvService;
