import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IUpdatedepartment } from "../utlis/interfaces/setting.interface";
import SettingModel from "../../models/reservationPanel/Setting.Model";

class DepartmentSettingService extends AbstractServices {
  constructor() {
    super();
  }

  //=================== Department service ======================//

  // create Department
  public async createDepartment(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { name } = req.body;

      // Department check
      const settingModel = this.Model.settingModel();

      const { data } = await settingModel.getAllDepartment({
        name,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Department name already exists",
        };
      }
      // model
      const model = new SettingModel(trx);

      await model.createDepartment({
        hotel_code,
        name,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Department created successfully.",
      };
    });
  }

  // Get all Department
  public async getAllDepartment(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, status } = req.query;

    const model = this.Model.settingModel();

    const { data, total } = await model.getAllDepartment({
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

  // Update Department
  public async updateDepartment(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdatedepartment;

      const model = this.Model.settingModel(trx);

      const { data } = await model.getAllDepartment({
        name: updatePayload.name,
        hotel_code,
        excludeId: parseInt(req.params.id),
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Department name already exists",
        };
      }

      await model.updateDepartment(parseInt(id), hotel_code, {
        name: updatePayload.name,
        status: updatePayload.status,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Department updated successfully",
      };
    });
  }

  // Delete Department
  public async deleteDepartment(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);
      await model.deleteDepartment(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Department deleted successfully",
      };
    });
  }
}
export default DepartmentSettingService;
