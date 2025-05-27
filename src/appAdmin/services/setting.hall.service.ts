import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IUpdateHallAmenitiesPayload } from "../utlis/interfaces/setting.interface";
import SettingModel from "../../models/reservationPanel/Setting.Model";

class HallSettingService extends AbstractServices {
  constructor() {
    super();
  }

  //=================== Hall Amenities ======================//

  // create Hall Amenities
  public async createHallAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { name, description } = req.body;

      // Hall amenities check
      const settingModel = this.Model.settingModel();

      const { data } = await settingModel.getAllHallAmenities({
        name: req.body.name,
        hotel_code,
      });

      if (data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: " Hall Amenities name already exists",
        };
      }

      // model
      const model = new SettingModel(trx);

      await model.createHallAmenities({
        hotel_code,
        name,
        description,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Hall Amenities created successfully.",
      };
    });
  }

  // Get All Hall Amenities
  public async getAllHallAmenities(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, description, status } = req.query;

    const model = this.Model.settingModel();

    const { data, total } = await model.getAllHallAmenities({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      name: name as string,
      description: description as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Hall Amenities
  public async updateHallAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const updatePayload = req.body as IUpdateHallAmenitiesPayload;

      const model = this.Model.settingModel(trx);

      // Hall amenities check
      const settingModel = this.Model.settingModel();

      const { data } = await settingModel.getAllHallAmenities({
        name: updatePayload.name,
        hotel_code,
        excludeId: parseInt(req.params.id),
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Hall Amenities already exists",
        };
      }

      await model.updateHallAmenities(parseInt(id), hotel_code, {
        name: updatePayload.name,
        description: updatePayload.description,
        status: updatePayload.status,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Hall Amenities updated successfully",
      };
    });
  }

  // Delete Hall Amenities
  public async deleteHallAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);
      await model.deleteHallAmenities(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Hall Amenities deleted successfully",
      };
    });
  }
}
export default HallSettingService;
