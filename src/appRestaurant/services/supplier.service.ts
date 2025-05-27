import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IUpdateSupplierPayload } from "../utils/interfaces/supplier.interface";

class SupplierService extends AbstractServices {
  constructor() {
    super();
  }

  //=================== Supplier service ======================//

  // create Supplier
  public async createSupplier(req: Request) {
    const { res_id, hotel_code, id } = req.rest_user;
    const { name, phone } = req.body;

    // Supplier name check
    const Model = this.Model.CommonInventoryModel();

    const { data } = await Model.getAllSupplier({ name, res_id, hotel_code });

    if (data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: "Supplier name already exists, give another unique Supplier",
      };
    }

    await Model.createSupplier({
      res_id,
      created_by: id,
      hotel_code,
      name,
      phone,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Supplier created successfully.",
    };
  }

  // Get all Supplier
  public async getAllSupplier(req: Request) {
    const { res_id, hotel_code } = req.rest_user;
    const { limit, skip, name, status } = req.query;

    const { data, total } =
      await this.Model.CommonInventoryModel().getAllSupplier({
        name: name as string,
        status: status as string,
        limit: limit as string,
        skip: skip as string,
        res_id,
        hotel_code,
      });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Supplier
  public async updateSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.rest_user;
      const { id } = req.params;

      const updatePayload = req.body as IUpdateSupplierPayload;

      const res = await this.Model.CommonInventoryModel().updateSupplier(
        parseInt(id),
        hotel_code,
        updatePayload
      );

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Supplier updated successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier didn't find  from this ID",
        };
      }
    });
  }

  // Delete Supplier
  public async deleteSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.restaurantModel(trx);
      const res = await model.deleteSupplier(parseInt(id));

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Supplier deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Supplier didn't find from this ID",
        };
      }
    });
  }
}
export default SupplierService;
