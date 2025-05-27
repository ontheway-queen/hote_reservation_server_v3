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

  // create permission group
  public async createPermissionGroup(req: Request) {
    const { id } = req.admin;
    const model = this.Model.mConfigurationModel();

    // get all permission group
    const checkGroup = await model.getAllRolePermissionGroup({
      name: req.body.name,
    });

    if (checkGroup.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.HTTP_CONFLICT,
      };
    }

    await model.createPermissionGroup({
      ...req.body,
      created_by: id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }
  // get permission group
  public async getPermissionGroup(req: Request) {
    const model = this.Model.mConfigurationModel();
    const data = await model.getAllRolePermissionGroup({});

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data,
    };
  }

  // create permission
  public async createPermission(req: Request) {
    const { id } = req.admin;

    const { permission_group_id, name } = req.body;
    const model = this.Model.mConfigurationModel();
    await model.createPermission({
      permission_group_id,
      name,
      created_by: id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  // get single hotel permission
  public async getSingleHotelPermission(req: Request) {
    const { id } = req.params;

    const data: IhotelPermissions[] =
      await this.Model.mConfigurationModel().getAllPermissionByHotel(
        parseInt(id)
      );

    const { permissions } = data[0];

    const groupedPermissions: any = {};

    permissions?.forEach((entry) => {
      const permission_group_id = entry.permission_group_id;
      const permission = {
        permission_id: entry.permission_id,
        permission_name: entry.permission_name,
      };

      if (!groupedPermissions[permission_group_id]) {
        groupedPermissions[permission_group_id] = {
          permission_group_id: permission_group_id,
          permissionGroupName: entry.permission_group_name,
          permissions: [permission],
        };
      } else {
        groupedPermissions[permission_group_id].permissions.push(permission);
      }
    });
    const result = Object.values(groupedPermissions);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: result,
    };
  }

  // update hotel permission
  public async updateSingleHotelPermission(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const { added, deleted } = req.body;

      const model = this.Model.mConfigurationModel(trx);

      const checkHotelPermission = await model.getAllPermissionByHotel(
        parseInt(id)
      );

      const { permissions } = checkHotelPermission[0];

      let distinctValueForAdd = [];

      let existRolePermissionIds = [];

      if (permissions?.length) {
        existRolePermissionIds = permissions.map(
          (item: any) => item.h_permission_id
        );
        if (added?.length) {
          let existHotelPermissionIds;

          existHotelPermissionIds = permissions.map(
            (item: any) => item.permission_id
          );

          for (let i = 0; i < added.length; i++) {
            let found = false;
            for (let j = 0; j < existHotelPermissionIds.length; j++) {
              if (added[i] == existHotelPermissionIds[j]) {
                found = true;
                break;
              }
            }
            if (!found) {
              distinctValueForAdd.push(added[i]);
            }
          }
        }
      } else {
        distinctValueForAdd = added;
      }

      if (distinctValueForAdd.length) {
        const hotelPermissionInsertPayload = distinctValueForAdd.map(
          (item: any) => {
            return {
              hotel_code: id,
              permission_id: item,
            };
          }
        );

        // insert hotel permission payload
        await model.addedHotelPermission(hotelPermissionInsertPayload);
      }

      if (deleted?.length) {
        const deleteRolePermission = [];

        for (let i = 0; i < deleted.length; i++) {
          for (let j = 0; j < permissions.length; j++) {
            if (deleted[i] == permissions[j].permission_id) {
              deleteRolePermission.push(permissions[j].h_permission_id);
            }
          }
        }

        // delete role permission
        if (deleteRolePermission.length) {
          await model.deleteHotelRolePermission(
            parseInt(id),
            deleteRolePermission
          );
        }
        // delte hotel role permission
        await model.deleteHotelPermission(parseInt(id), deleted);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Permission Updated",
      };
    });
  }

  // get all permission
  public async getAllPermission(req: Request) {
    const model = this.Model.mConfigurationModel();
    const data = await model.getAllPermission();

    const groupedPermissions: any = {};

    data.forEach((entry) => {
      const permission_group_id = entry.permission_group_id;
      const permission = {
        permission_id: entry.permission_id,
        permission_name: entry.permission_name,
      };

      if (!groupedPermissions[permission_group_id]) {
        groupedPermissions[permission_group_id] = {
          permission_group_id: permission_group_id,
          permissionGroupName: entry.permission_group_name,
          permissions: [permission],
        };
      } else {
        groupedPermissions[permission_group_id].permissions.push(permission);
      }
    });

    const result = Object.values(groupedPermissions);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: result,
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
