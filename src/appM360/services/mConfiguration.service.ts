import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  HotelPermission,
  IhotelPermissions,
  UpdateHotelPermissionReqBody,
} from "../utlis/interfaces/mConfiguration.interfaces.";
import CustomError from "../../utils/lib/customEror";

class MConfigurationService extends AbstractServices {
  constructor() {
    super();
  }

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

  public async getPermissionGroup(req: Request) {
    const model = this.Model.mConfigurationModel();
    const data = await model.getAllRolePermissionGroup({});

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // create permission
  public async createPermission(req: Request) {
    const { id } = req.admin;

    const { permission_group_id, name } = req.body;

    // check group
    const check =
      await this.Model.mConfigurationModel().getSinglePermissionGroup(
        permission_group_id
      );

    if (!check.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "Invalid group ID",
      };
    }

    const insertObj = name.map((item: string) => {
      return {
        permission_group_id,
        name: item,
        created_by: id,
      };
    });

    await this.Model.mConfigurationModel().createPermission(insertObj);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async getSingleHotelPermission(req: Request) {
    const { hotel_code } = req.params;

    const data = await this.Model.mConfigurationModel().getAllPermissionByHotel(
      parseInt(hotel_code)
    );

    const { permissions } = data;

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

  public async updateSingleHotelPermission(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = parseInt(req.params.hotel_code);
      const { added = [], deleted = [] }: UpdateHotelPermissionReqBody =
        req.body;

      const model = this.Model.mConfigurationModel(trx);

      const checkHotelPermission = await model.getAllPermissionByHotel(
        hotel_code
      );

      const existingPermissions: HotelPermission[] =
        checkHotelPermission?.permissions || [];

      const existingPermissionIds = new Set(
        existingPermissions.map((perm) => perm.permission_id)
      );
      const existingHPermissionMap = new Map<number, number>();
      existingPermissions.forEach((perm) =>
        existingHPermissionMap.set(perm.permission_id, perm.h_permission_id)
      );

      // Filter only new permissions to add
      const newPermissionIds = added.filter(
        (permId) => !existingPermissionIds.has(permId)
      );

      if (newPermissionIds.length > 0) {
        const insertPayload = newPermissionIds.map((permId) => ({
          hotel_code: hotel_code,
          permission_id: permId,
        }));
        await model.addedHotelPermission(insertPayload);
      }

      if (deleted.length > 0) {
        const hPermissionIdsToDelete = deleted
          .map((permId) => existingHPermissionMap.get(permId))
          .filter((id): id is number => id !== undefined);

        if (hPermissionIdsToDelete.length > 0) {
          await model.deleteHotelRolePermission(
            hotel_code,
            hPermissionIdsToDelete
          );
        }

        await model.deleteHotelPermission(hotel_code, deleted);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Permission Updated",
      };
    });
  }

  public async getAllPermission(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllPermission({});

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

  //---------------------------

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

  public async createAmenitiesHead(req: Request) {
    return await this.db.transaction(async (trx) => {
      // room amenities
      const model = this.Model.mConfigurationModel(trx);
      const { data } = await model.getAllAmenitiesHead({
        search: req.body.name,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities head already exists",
        };
      }

      await model.createAmenitiesHead(req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Amenities head created successfully.",
      };
    });
  }

  public async getAllAmenitiesHead(req: Request) {
    const { limit, skip, search, status } = req.query;

    const { data } = await this.Model.mConfigurationModel().getAllAmenitiesHead(
      {
        status: status as string,
        limit: limit as string,
        skip: skip as string,
        search: search as string,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data,
    };
  }

  public async updateAmenitiesHead(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);
      const { data } = await model.getAllAmenitiesHead({
        search: req.body.name,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities head already exists",
        };
      }

      await model.updateAmenitiesHead(parseInt(id), req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room amenities head updated successfully",
      };
    });
  }

  public async createAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        req.body["icon"] = files[0].filename;
      }

      // room amenities
      const settingModel = this.Model.mConfigurationModel(trx);

      const { data } = await settingModel.getAllAmenities({
        search: req.body.name,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type amenities already exists",
        };
      }

      await settingModel.createAmenities(req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Amenities created successfully.",
      };
    });
  }

  public async getAllAmenities(req: Request) {
    const { limit, skip, search, status } = req.query;

    const model = this.Model.mConfigurationModel();

    const { data, total } = await model.getAllAmenities({
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

  public async updateAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length) {
        req.body["icon"] = files[0].filename;
      }

      if (req.body?.name) {
        const { data } = await model.getAllAmenities({
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

      await model.updateAmenities(parseInt(id), req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room Amenities updated successfully",
      };
    });
  }

  public async deleteAmenities(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.mConfigurationModel(trx);
      await model.deleteAmenities(parseInt(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room Amenities deleted successfully",
      };
    });
  }
}

export default MConfigurationService;
