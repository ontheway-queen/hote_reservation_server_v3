import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  ICreateCommonInvPayload,
  IUpdateCommonInvPayload,
  IUpdateInvSupplierPayload,
} from "../utils/interfaces/common.inv.interface";

class CommonInvService extends AbstractServices {
  constructor() {
    super();
  }

  //=================== Category ======================//

  public async createCategory(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { name } = req.body as ICreateCommonInvPayload;

      // Check for existing category
      const Model = this.Model.CommonInventoryModel(trx);

      const { data } = await Model.getAllCategory({
        name: req.body.name,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Category name already exists",
        };
      }

      await Model.createCategory({
        hotel_code,
        name,
        created_by: admin_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Category created successfully.",
      };
    });
  }

  // Get all Category
  public async getAllCategory(req: Request) {
    const { limit, skip, name, status } = req.query;
    const { hotel_code } = req.hotel_admin;
    const model = this.Model.CommonInventoryModel();

    const { data, total } = await model.getAllCategory({
      name: name as string,
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

  // Update Category
  public async updateCategory(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdateCommonInvPayload;
      const model = this.Model.CommonInventoryModel(trx);

      const { data: existingCategory } = await model.getAllCategory({
        hotel_code,
        id: parseInt(id),
      });

      if (!existingCategory.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Category not found with this ID",
        };
      }

      if (updatePayload.name) {
        const { data: duplicateName } = await model.getAllCategory({
          name: updatePayload.name,
          hotel_code,
          excludeId: parseInt(id),
        });

        if (duplicateName.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Category name already exists",
          };
        }
      }

      const payloadToUpdate: any = {};
      if (updatePayload.name !== undefined)
        payloadToUpdate.name = updatePayload.name;
      if (updatePayload.status !== undefined)
        payloadToUpdate.status = updatePayload.status;

      const res = await model.updateCategory(parseInt(id), payloadToUpdate);

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Category updated successfully",
        };
      }

      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Category not found with this ID",
      };
    });
  }

  public async deleteCategory(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;
      const model = this.Model.CommonInventoryModel(trx);

      const { data: existingCategory } = await model.getAllCategory({
        hotel_code,
        id: parseInt(id),
      });

      if (!existingCategory.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Category not found with this ID",
        };
      }

      const res = await model.updateCategory(parseInt(id), {
        is_deleted: true,
      });
      if (res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Category deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Category didn't find from this ID",
        };
      }
    });
  }

  //=================== Unit ======================//

  // create Unit
  public async createUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { name, short_code } = req.body as ICreateCommonInvPayload;

      // Category name check
      const Model = this.Model.CommonInventoryModel(trx);

      const { data } = await Model.getAllUnit({
        key: name || (short_code as string),
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Unit name already exists",
        };
      }

      await Model.createUnit({
        hotel_code,
        name,
        short_code,
        created_by: admin_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Unit created successfully.",
      };
    });
  }

  // Get all Unit
  public async getAllUnit(req: Request) {
    const { limit, skip, name, status } = req.query;

    const { hotel_code } = req.hotel_admin;

    const model = this.Model.CommonInventoryModel();

    const { data, total } = await model.getAllUnit({
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

  // Update Unit
  public async updateUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdateCommonInvPayload;

      const model = this.Model.CommonInventoryModel(trx);

      const { name, short_code } = updatePayload;
      if (name) {
        const { data: nameExists } = await model.getAllUnit({
          key: name,
          hotel_code,
          excludeId: parseInt(id),
        });

        if (nameExists.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Unit name already exists",
          };
        }
      }
      if (short_code) {
        const { data: shortCodeExists } = await model.getAllUnit({
          key: short_code,
          hotel_code,
          excludeId: parseInt(id),
        });

        if (shortCodeExists.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Unit short code already exists",
          };
        }
      }
      const res = await model.updateUnit(
        parseInt(id),
        hotel_code,
        updatePayload
      );
      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Unit updated successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Unit didn't find  from this ID",
        };
      }
    });
  }

  public async deleteUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;
      const model = this.Model.CommonInventoryModel(trx);
      const res = await model.updateUnit(parseInt(id), hotel_code, {
        is_deleted: true,
      });
      if (res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Unit deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Unit didn't find from this ID",
        };
      }
    });
  }

  //=================== Brand ======================//

  // create Unit
  public async createBrand(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { name } = req.body as ICreateCommonInvPayload;

      // Category name check
      const Model = this.Model.CommonInventoryModel(trx);

      const { data } = await Model.getAllBrand({ name, hotel_code });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Brand name already exists",
        };
      }

      await Model.createBrand({
        hotel_code,
        name,
        created_by: admin_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Brand created successfully.",
      };
    });
  }

  // Get all Brand
  public async getAllBrand(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, status } = req.query;

    const model = this.Model.CommonInventoryModel();

    const { data, total } = await model.getAllBrand({
      hotel_code,
      name: name as string,
      status: status as string,
      limit: limit as string,
      skip: skip as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Brand
  public async updateBrand(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdateCommonInvPayload;

      const model = this.Model.CommonInventoryModel(trx);

      const { data } = await model.getAllBrand({
        name: updatePayload.name as string,
        hotel_code,
        excludeId: parseInt(req.params.id),
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Brand name already exists",
        };
      }

      const res = await model.updateBrand(
        parseInt(id),
        hotel_code,
        updatePayload
      );

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Brand updated successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Brand didn't find  from this ID",
        };
      }
    });
  }

  // Delete Brand
  public async deleteBrand(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;
      const model = this.Model.CommonInventoryModel(trx);
      const res = await model.updateBrand(parseInt(id), hotel_code, {
        is_deleted: true,
      });
      if (res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Brand deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Brand didn't find from this ID",
        };
      }
    });
  }

  //=================== Supplier service ======================//

  // create Supplier
  public async createSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { name, phone, last_balance } = req.body;

      // Supplier name check
      const Model = this.Model.CommonInventoryModel(trx);

      const { data } = await Model.getAllSupplier({ name, hotel_code });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Supplier name already exists",
        };
      }

      await Model.createSupplier({
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

  // Get all Supplier
  public async getAllSupplier(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, status } = req.query;

    const model = this.Model.CommonInventoryModel();

    const { data, total } = await model.getAllSupplier({
      name: name as string,
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

  // Get all Supplier Payment
  public async getAllSupplierPaymentById(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, from_date, to_date } = req.query;

    const { data, total } =
      await this.Model.CommonInventoryModel().getAllSupplierPaymentById({
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
      await this.Model.CommonInventoryModel().getAllSupplierInvoiceBySupId({
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

  // Update Supplier
  public async updateSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;
      const updatePayload = req.body as IUpdateInvSupplierPayload;

      const model = this.Model.CommonInventoryModel(trx);

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

      const res = await model.updateSupplier(
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
          message: "Supplier not found with this ID",
        };
      }
    });
  }

  // Delete Supplier
  public async deleteSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.CommonInventoryModel(trx);

      const res = await model.updateSupplier(parseInt(id), hotel_code, {
        is_deleted: true,
      });

      if (res) {
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
export default CommonInvService;
