import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IhotelPermissions,
  IUpdateRoomTypeAmenitiesPayload,
} from "../utlis/interfaces/mConfiguration.interfaces.";
import SettingModel from "../../models/reservationPanel/Setting.Model";

class MConfigurationService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllAccomodation(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllAccomodation({
      status: req.query.status as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getSingleAccomodation(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllAccomodation({
      status: req.query.status as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getAllCity(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllCity({
      limit: parseInt(req.query.limit as string),
      skip: parseInt(req.query.limit as string),
      search: req.query.search as string,
      country_code: req.query.country_code as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async insertCity(req: Request) {
    const getLastCityCode =
      await this.Model.mConfigurationModel().getLastCityCode();

    await this.Model.mConfigurationModel().insertCity({
      ...req.body,
      city_code: getLastCityCode + 1,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async getAllCountry(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllCountry({
      limit: parseInt(req.query.limit as string),
      skip: parseInt(req.query.limit as string),
      search: req.query.search as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // create permission
  public async createPermission(req: Request) {
    const { id } = req.admin;

    await this.Model.mConfigurationModel().createPermission({
      name: req.body.name,
      created_by: id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  // get all permission
  public async getAllPermission(req: Request) {
    const model = this.Model.mConfigurationModel();
    const data = await model.getAllPermission();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //=================== Room type Amenities ======================//

  // create Room Amenities head
  public async createRoomTypeAmenitiesHead(req: Request) {
    return await this.db.transaction(async (trx) => {
      // room amenities
      const model = this.Model.mConfigurationModel(trx);
      const { data } = await model.getAllRoomTypeAmenitiesHead({
        search: req.body.name,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities head already exists",
        };
      }

      await model.createRoomTypeAmenitiesHead(req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Amenities head created successfully.",
      };
    });
  }

  // Get All Room Amenities head
  public async getAllRoomTypeAmenitiesHead(req: Request) {
    const { limit, skip, search, status } = req.query;

    const { data } =
      await this.Model.mConfigurationModel().getAllRoomTypeAmenitiesHead({
        status: status as string,
        limit: limit as string,
        skip: skip as string,
        search: search as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data,
    };
  }

  // Update Room type Amenities head
  public async updateRoomTypeAmenitiesHead(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);
      const { data } = await model.getAllRoomTypeAmenitiesHead({
        search: req.body.name,
      });

      console.log({ data });
      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities head already exists",
        };
      }

      console.log({ id });

      await model.updateRoomTypeAmenitiesHead(parseInt(id), req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room amenities head updated successfully",
      };
    });
  }

  // create Room Amenities
  public async createRoomTypeAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        req.body["icon"] = files[0].filename;
      }

      // room amenities
      const settingModel = this.Model.mConfigurationModel(trx);

      const { data } = await settingModel.getAllRoomTypeAmenities({
        search: req.body.name,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities already exists",
        };
      }

      await settingModel.createRoomTypeAmenities(req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Amenities created successfully.",
      };
    });
  }

  // Get All Room Amenities
  public async getAllRoomTypeAmenities(req: Request) {
    const { limit, skip, search, status } = req.query;

    const model = this.Model.mConfigurationModel();

    const { data, total } = await model.getAllRoomTypeAmenities({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Room Amenities
  public async updateRoomTypeAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length) {
        req.body["icon"] = files[0].filename;
      }

      if (req.body?.name) {
        const { data } = await model.getAllRoomTypeAmenities({
          search: req.body.name,
        });

        if (data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: " Room Amenities already exists",
          };
        }
      }

      await model.updateRoomTypeAmenities(parseInt(id), req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room Amenities updated successfully",
      };
    });
  }

  // Delete Room Amenities
  public async deleteRoomTypeAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);
      await model.deleteRoomTypeAmenities(parseInt(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room Amenities deleted successfully",
      };
    });
  }
}

export default MConfigurationService;
