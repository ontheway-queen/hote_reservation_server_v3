import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import {
  ICreateRoomTypeBodyPayload,
  IUpdateRoomTypeBodyPayload,
} from "../utlis/interfaces/setting.interface";

class RoomSettingService extends AbstractServices {
  constructor() {
    super();
  }

  // create room type
  public async createRoomType(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { beds, rt_amenities, categories_type_id, ...rest } =
        req.body as ICreateRoomTypeBodyPayload;

      const settingModel = this.Model.settingModel(trx);

      // check room type by name

      const { data: roomTypeData } = await settingModel.getAllRoomType({
        search: rest.name,
        hotel_code,
      });

      if (roomTypeData.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room type name is already exist",
        };
      }

      // bed type check
      const bedIds = beds.map((item) => item.bed_type_id);

      const bedTypeData = await settingModel.getAllBedType({
        bedIds: bedIds,
        hotel_code,
      });

      if (bedTypeData.data.length !== bedIds.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Bed Type not found",
        };
      }

      // insert in room type
      const roomTypeRes = await settingModel.createRoomType({
        description: rest.description,
        hotel_code,
        categories_type_id,
        name: rest.name,
        room_info: rest.room_info,
        area: rest.area,
      });

      console.log({ roomTypeRes });
      // photos
      const room_type_photos: {
        hotel_code: number;
        room_type_id: number;
        photo_url: string;
      }[] = [];

      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        files.forEach((item) => {
          room_type_photos.push({
            hotel_code,
            photo_url: item.filename,
            room_type_id: roomTypeRes[0].id,
          });
        });
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Room type photos have to be given",
        };
      }

      console.log({ room_type_photos });
      await settingModel.insertRoomTypePhotos(room_type_photos);

      // room type beds
      const roomTypeBedsPayload: {
        quantity: number;
        room_type_id: number;
        bed_type_id: number;
      }[] = beds.map((item) => {
        return {
          bed_type_id: item.bed_type_id,
          room_type_id: roomTypeRes[0].id,
          quantity: item.quantity,
        };
      });

      await settingModel.insertRoomTypeBeds(roomTypeBedsPayload);

      await settingModel.insertRoomTypeAmenities({
        hotel_code,
        room_type_id: roomTypeRes[0].id,
        rt_amenities,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Type created successfully.",
      };
    });
  }

  // Get all room type
  public async getAllRoomType(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const { data, total } = await this.Model.settingModel().getAllRoomType({
      is_active: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get single room type
  public async getSingleRoomType(req: Request) {
    const data = await this.Model.settingModel().getSingleRoomType(
      parseInt(req.params.id),
      req.hotel_admin.hotel_code
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

  // Update room type
  public async updateRoomType(req: Request) {
    const data = await this.Model.settingModel().getSingleRoomType(
      parseInt(req.params.id),
      req.hotel_admin.hotel_code
    );

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const {
        beds,
        rt_amenities,
        remove_photos,
        categories_type_id,
        remove_beds,
        ...rest
      } = req.body as IUpdateRoomTypeBodyPayload;

      const settingModel = this.Model.settingModel(trx);

      if (rest.name) {
        // check room type by name
        const { data: roomTypeData } = await settingModel.getAllRoomType({
          search: rest.name,
          hotel_code,
        });

        if (roomTypeData.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Room type name is already exist",
          };
        }
      }

      if (beds) {
        // bed type check
        const bedIds = beds.map((item) => item.bed_type_id);

        const bedTypeData = await settingModel.getAllBedType({
          bedIds: bedIds,
          hotel_code,
        });

        if (bedTypeData.data.length !== bedIds.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Bed Type not found",
          };
        }
      }

      const restData = Object.keys(rest);

      if (restData.length) {
        // insert in room type
        await settingModel.updateRoomType(parseInt(req.params.id), hotel_code, {
          base_occupancy: rest.base_occupancy,
          bed_count: rest.bed_count,
          description: rest.description,
          max_adults: rest.max_adults,
          max_children: rest.max_children,
          max_occupancy: rest.max_occupancy,
          categories_type_id,
          name: rest.name,
          room_info: rest.room_info,
          area: rest.area,
        });
      }

      // photos
      const room_type_photos: {
        hotel_code: number;
        room_type_id: number;
        photo_url: string;
      }[] = [];

      const files = (req.files as Express.Multer.File[]) || [];

      if (files?.length) {
        files.forEach((item) => {
          room_type_photos.push({
            hotel_code,
            photo_url: item.filename,
            room_type_id: parseInt(req.params.id),
          });
        });
      }

      // insert photos
      if (room_type_photos?.length) {
        await settingModel.insertRoomTypePhotos(room_type_photos);
      }

      // insert bed
      if (beds?.length) {
        // room type beds
        const roomTypeBedsPayload: {
          quantity: number;
          room_type_id: number;
          bed_type_id: number;
        }[] = beds?.map((item) => {
          return {
            bed_type_id: item.bed_type_id,
            room_type_id: parseInt(req.params.id),
            quantity: item.quantity,
          };
        });

        await settingModel.insertRoomTypeBeds(roomTypeBedsPayload);
      }

      // insert room amenities
      if (rt_amenities) {
        await settingModel.insertRoomTypeAmenities({
          hotel_code,
          room_type_id: parseInt(req.params.id),
          rt_amenities,
        });
      }

      // remove beds
      if (remove_beds?.length) {
        await settingModel.deleteBedsOfRoomType(
          parseInt(req.params.id),
          remove_beds
        );
      }

      // remove photos
      if (remove_photos?.length) {
        await settingModel.deletePhotosOfRoomType(
          parseInt(req.params.id),
          remove_photos
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room Type updated successfully.",
      };
    });
  }

  // Delete room type
  public async deleteRoomType(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);
      await model.deleteRoomType(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room Type deleted successfully",
      };
    });
  }

  public async getAllRoomTypeAmenities(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const model = this.Model.settingModel();
    const { data } = await model.getAllRoomTypeAmenities({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //=================== Room Type Categories ======================//

  // create room type
  public async createRoomTypeCategories(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { name } = req.body;

      // room type check
      const settingModel = this.Model.settingModel(trx);

      const data = await settingModel.getAllRoomTypeCategories({
        exact_match: name,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room Type Categories already exists",
        };
      }

      await settingModel.createRoomTypeCategories({
        hotel_code,
        name,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room type categories created successfully.",
      };
    });
  }

  // Get all room type
  public async getAllRoomTypeCategories(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, room_type, status } = req.query;

    const data = await this.Model.settingModel().getAllRoomTypeCategories({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: room_type as string,
      hotel_code,
      is_deleted: false,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // Update room type
  public async updateRoomTypeCategories(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      const model = this.Model.settingModel(trx);

      // get single room type categories
      const data = await model.getSingleRoomTypeCategories(
        parseInt(req.params.id),
        hotel_code
      );

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Room Type Categories not found",
        };
      }

      if (req.body?.name) {
        const data = await model.getAllRoomTypeCategories({
          exact_match: req.body.name,
          hotel_code,
        });

        if (data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Room Type already exists",
          };
        }
      }

      await model.updateRoomTypeCategories(
        parseInt(req.params.id),
        hotel_code,
        req.body
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room type categories updated successfully",
      };
    });
  }

  // Delete room type
  public async deleteRoomTypeCategories(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const model = this.Model.settingModel();

    // get single room type categories
    const data = await model.getSingleRoomTypeCategories(
      parseInt(req.params.id),
      hotel_code
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Room Type Categories not found",
      };
    }

    await model.updateRoomTypeCategories(parseInt(req.params.id), hotel_code, {
      is_deleted: true,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Room Type deleted successfully",
    };
  }

  //=================== Bed Type ======================//

  // create bed type
  public async createBedType(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;

      // bed type check
      const model = this.Model.settingModel(trx);

      const { data } = await model.getAllBedType({
        search: req.body.name,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Bed Type already exists",
        };
      }

      await model.createBedType({
        hotel_code,
        ...req.body,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Bed Type created successfully.",
      };
    });
  }

  // Get all bed type
  public async getAllBedType(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const model = this.Model.settingModel();

    const { data } = await model.getAllBedType({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data,
    };
  }

  // Update bed type
  public async updateBedType(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      if (req.body?.name) {
        const { data } = await model.getAllBedType({
          search: req.body.name,
          hotel_code,
        });

        if (data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Bed Type already exists",
          };
        }
      }

      await model.updateBedType(parseInt(id), hotel_code, req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Bed Type updated successfully",
      };
    });
  }

  // Delete bed type
  public async deleteBedType(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      await model.updateBedType(parseInt(id), hotel_code, {
        is_deleted: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Bed Type deleted successfully",
      };
    });
  }

  //=================== Floor Setup ======================//

  public async createFloorSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { floor_no } = req.body;

      // check if floor already exists
      const model = this.Model.settingModel(trx);
      const { data } = await model.getAllFloors({
        search: floor_no,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Floor already exists",
        };
      }

      await model.createFloor({ hotel_code, floor_no });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Floor created successfully.",
      };
    });
  }

  public async getAllFloorSetup(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const model = this.Model.settingModel();

    const { data } = await model.getAllFloors({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateFloorSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      // check if floor exists
      const data = await model.getSingleFloor(parseInt(id), hotel_code);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Floor not found",
        };
      }

      await model.updateFloor(parseInt(id), hotel_code, req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Floor updated successfully",
      };
    });
  }

  public async deleteFloorSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      // check if floor exists
      const data = await model.getSingleFloor(parseInt(id), hotel_code);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Floor not found",
        };
      }

      await model.deleteFloor(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Floor deleted successfully",
      };
    });
  }

  //=================== Building Setup ======================//

  public async createBuildingSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { building_no } = req.body;

      console.log(req.body);

      // check if building already exists
      const model = this.Model.settingModel(trx);
      const { data } = await model.getAllBuildings({
        search: building_no,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Building already exists",
        };
      }

      await model.createBuilding({ hotel_code, ...req.body });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Building created successfully.",
      };
    });
  }

  public async getAllBuildingSetup(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const model = this.Model.settingModel();

    const { data } = await model.getAllBuildings({
      status: status as string,
      limit: limit as string,
      skip: skip as string,
      search: search as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateBuildingSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      // check if building exists
      const data = await model.getSingleBuilding(parseInt(id), hotel_code);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Building not found",
        };
      }

      await model.updateBuilding(parseInt(id), hotel_code, req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Building updated successfully",
      };
    });
  }

  public async deleteBuildingSetup(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { id } = req.params;

      const model = this.Model.settingModel(trx);

      // check if building exists
      const data = await model.getSingleBuilding(parseInt(id), hotel_code);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Building not found",
        };
      }

      await model.deleteBuilding(parseInt(id), hotel_code);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Building deleted successfully",
      };
    });
  }
}
export default RoomSettingService;
