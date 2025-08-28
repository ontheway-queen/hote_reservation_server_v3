import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IUpdatedesignation } from "../utlis/interfaces/setting.interface";
import SettingModel from "../../models/reservationPanel/Setting.Model";

class DesignationSettingService extends AbstractServices {
  constructor() {
    super();
  }

  public async createDesignation(req: Request) {
    return await this.db.transaction(async (trx) => {
      console.log(req.hotel_admin);
      const { hotel_code, id } = req.hotel_admin;
      const { name } = req.body;

      const model = this.Model.hrModel(trx);

      const { data } = await model.getAllDesignation({
        name,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            "Designation name already exists, give another unique designation name",
        };
      }

      await model.createDesignation({
        hotel_code,
        name,
        created_by: id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Designation created successfully.",
      };
    });
  }

  // Get all designation
  public async getAllDesignation(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, status } = req.query;

    const { data, total } = await this.Model.hrModel().getAllDesignation({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      name: name as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Designation
  public async updateDesignation(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdatedesignation;

      const model = this.Model.hrModel(trx);

      const { data } = await model.getAllDesignation({
        name: updatePayload.name,
        hotel_code,
        excludeId: parseInt(req.params.id),
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Designation name already exists",
        };
      }

      await model.updateDesignation(parseInt(id), hotel_code, {
        name: updatePayload.name,
        status: updatePayload.status,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Designation name updated successfully",
      };
    });
  }

  // Delete Designation
  public async deleteDesignation(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.hrModel(trx);
      await model.deleteDesignation(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Designation deleted successfully",
      };
    });
  }
}
export default DesignationSettingService;
