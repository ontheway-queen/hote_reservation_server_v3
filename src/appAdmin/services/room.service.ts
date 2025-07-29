import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IcreateRoomBody,
  IUpdateRoomAvailabilitiesPayload,
  IupdateRoomBody,
} from "../utlis/interfaces/Room.interfaces";

export class RoomService extends AbstractServices {
  constructor() {
    super();
  }

  public async createRoom(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { room_type_id, room_name } = req.body as IcreateRoomBody;
      const { hotel_code, id: user_id } = req.hotel_admin;

      const settingModel = this.Model.settingModel(trx);
      const roomModel = this.Model.RoomModel(trx);

      const checkRoomType = await settingModel.getSingleRoomType(
        room_type_id,
        hotel_code
      );
      if (!checkRoomType.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Room type is not found",
        };
      }

      // Check for duplicate room name
      const { data: duplicateRooms } = await roomModel.getAllRoom({
        hotel_code,
        exact_name: room_name,
      });

      if (duplicateRooms.length > 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Room name already exists",
        };
      }

      //  Insert new room
      await roomModel.createRoom({
        ...req.body,
        hotel_code,
        created_by: user_id,
      });

      // Handle room availability
      const availability = await roomModel.getRoomAvailabilitiesByRoomTypeId(
        hotel_code,
        room_type_id
      );

      if (availability) {
        const updates: IUpdateRoomAvailabilitiesPayload[] = availability.map(
          (row) => {
            const updatedTotal = row.total_rooms + 1;
            const updatedAvailable = row.available_rooms + 1;

            return {
              id: row.id,
              total_rooms: updatedTotal,
              available_rooms: updatedAvailable,
            };
          }
        );

        await roomModel.updateInRoomAvailabilities(updates);
      } else {
        const roomAvaibilityPayload = [] as {
          hotel_code: number;
          room_type_id: number;
          date: string;
          available_rooms: number;
          total_rooms: number;
        }[];
        for (let i = 0; i < 365; i++) {
          const date = new Date();
          date.setUTCDate(date.getUTCDate() + i);
          const dateStr = date.toISOString().split("T")[0];

          console.log({ dateStr });
          roomAvaibilityPayload.push({
            hotel_code,
            room_type_id,
            date: dateStr,
            available_rooms: 1,
            total_rooms: 1,
          });
        }
        await roomModel.insertInRoomAvilabilities(roomAvaibilityPayload);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room created successfully.",
      };
    });
  }

  public async createMultipleRooms(req: Request) {
    const { hotel_code, id: user_id } = req.hotel_admin;
    const { room_type_id, from_room, to_room, floor_no } = req.body;

    // Validate input
    if (from_room > to_room) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "From room number cannot be greater than to room number.",
      };
    }

    return await this.db.transaction(async (trx) => {
      const settingModel = this.Model.settingModel(trx);
      const roomModel = this.Model.RoomModel(trx);

      // Check if room type exists
      const roomTypeExists = await settingModel.getSingleRoomType(
        room_type_id,
        hotel_code
      );

      if (!roomTypeExists.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Room type not found.",
        };
      }

      const createdRooms: string[] = [];

      for (
        let roomNo = Number(from_room);
        roomNo <= Number(to_room);
        roomNo++
      ) {
        const room_name = roomNo.toString();

        // Check for existing room with the same name
        const { data: existingRooms } = await roomModel.getAllRoom({
          hotel_code,
          exact_name: room_name,
        });

        if (existingRooms.length === 0) {
          await roomModel.createRoom({
            room_name,
            floor_no,
            room_type_id,
            hotel_code,
            created_by: user_id,
          });
          createdRooms.push(room_name);
        }
      }

      const createdCount = createdRooms.length;

      if (createdCount > 0) {
        const availability = await roomModel.getRoomAvailabilitiesByRoomTypeId(
          hotel_code,
          room_type_id
        );

        if (availability && availability.length > 0) {
          const updatedPayload: IUpdateRoomAvailabilitiesPayload[] =
            availability.map((a) => {
              const total_rooms = a.total_rooms + createdCount;
              const available_rooms = a.available_rooms + createdCount;
              return {
                id: a.id,
                total_rooms,
                available_rooms,
              };
            });

          await roomModel.updateInRoomAvailabilities(updatedPayload);
        } else {
          // Prepare room availability records for the next 365 days
          const today = new Date();
          const roomAvailabilityPayload = Array.from(
            { length: 365 },
            (_, i) => {
              const date = new Date(today);
              date.setUTCDate(date.getUTCDate() + i);
              const dateStr = date.toISOString().split("T")[0];
              return {
                hotel_code,
                room_type_id,
                date: dateStr,
                available_rooms: createdCount,
                total_rooms: createdCount,
              };
            }
          );

          await roomModel.insertInRoomAvilabilities(roomAvailabilityPayload);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message:
          createdCount > 0
            ? `${createdCount} room(s) created successfully.`
            : "No new rooms were created due to duplication.",
      };
    });
  }

  public async getAllRoom(req: Request) {
    const { search, limit, skip, room_type_id, status } = req.query;

    const { hotel_code } = req.hotel_admin;

    const { data, total } = await this.Model.RoomModel().getAllRoom({
      search: search as string,
      limit: limit as string,
      status: status as string,
      skip: skip as string,
      hotel_code,
      room_type_id: parseInt(room_type_id as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getAllRoomByRoomStatus(req: Request) {
    const { search, limit, skip, room_type_id, status } = req.query;

    const { hotel_code } = req.hotel_admin;

    const { data, total } = await this.Model.RoomModel().getAllRoomByRoomStatus(
      {
        limit: limit as string,
        status: status as string,
        skip: skip as string,
        hotel_code,
        room_type_id: parseInt(room_type_id as string),
        current_date: req.query.current_date as string,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getAllRoomByRoomTypes(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { data, total } = await this.Model.RoomModel().getAllRoomByRoomTypes({
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getAllAvailableRooms(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { data, total } = await this.Model.RoomModel().getAllAvailableRooms({
      hotel_code,
      check_in: req.query.check_in as string,
      check_out: req.query.check_out as string,
      adult: parseInt(req.query.adult as string),
      child: parseInt(req.query.child as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async updateroom(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { room_id } = req.params;
      const { room_name, room_type_id } = req.body as IupdateRoomBody;

      const roomModel = this.Model.RoomModel(trx);

      const existingRoom = await roomModel.getSingleRoom(
        hotel_code,
        parseInt(room_id)
      );

      if (!existingRoom.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (room_name) {
        const { data: roomsWithSameName } = await roomModel.getAllRoom({
          hotel_code,
          exact_name: room_name,
        });
        if (roomsWithSameName.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Room name already exists",
          };
        }
      }

      const { room_type_id: exist_room_type_id } = existingRoom[0];

      // Room type has changed
      if (room_type_id && exist_room_type_id !== room_type_id) {
        const oldAvailabilities =
          await roomModel.getRoomAvailabilitiesByRoomTypeId(
            hotel_code,
            exist_room_type_id
          );

        const newAvailabilities =
          await roomModel.getRoomAvailabilitiesByRoomTypeId(
            hotel_code,
            room_type_id
          );

        if (newAvailabilities.length) {
          //  Update existing availabilities for new room_type_id
          const updates: IUpdateRoomAvailabilitiesPayload[] =
            newAvailabilities.map((row) => {
              const total_rooms = row.total_rooms + 1;
              const available_rooms = row.available_rooms + 1;
              return {
                id: row.id,
                total_rooms,
                available_rooms,
              };
            });
          await roomModel.updateInRoomAvailabilities(updates);
        } else {
          //  Insert 365 new entries for new room_type_id
          const today = new Date();
          const inserts = Array.from({ length: 365 }).map((_, i) => {
            const date = new Date(today);
            date.setUTCDate(date.getUTCDate() + i);
            const dateStr = date.toISOString().split("T")[0];
            return {
              hotel_code,
              room_type_id,
              date: dateStr,
              total_rooms: 1,
              available_rooms: 1,
            };
          });
          await roomModel.insertInRoomAvilabilities(inserts);
        }

        // Update old room_type_id availability: decrease count
        const updates: IUpdateRoomAvailabilitiesPayload[] =
          oldAvailabilities.map((row) => {
            const total_rooms = row.total_rooms - 1;
            const available_rooms = row.available_rooms - 1;
            return {
              id: row.id,
              total_rooms,
              available_rooms,
            };
          });
        await roomModel.updateInRoomAvailabilities(updates);

        // Apply room_type_id to update payload
        req.body["room_type_id"] = room_type_id;
      }

      await roomModel.updateRoom(parseInt(room_id), hotel_code, req.body);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room updated successfully",
      };
    });
  }

  public async updateRoomStatus(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { room_id } = req.params;
      const { hotel_code } = req.hotel_admin;
      const { status } = req.body as {
        status:
          | "in_service"
          | "out_of_service"
          | "clean"
          | "dirty"
          | "under_maintenance";
      };

      const roomModel = this.Model.RoomModel(trx);

      const roomId = parseInt(room_id);
      const existingRoom = await roomModel.getSingleRoom(hotel_code, roomId);

      if (!existingRoom.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const currentRoom = existingRoom[0];
      const currentStatus = currentRoom.status;

      if (currentStatus === status) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: `Room is already marked as ${status}.`,
        };
      }

      // Fetch all future room availability rows
      const availabilities = await roomModel.getRoomAvailabilitiesByRoomTypeId(
        hotel_code,
        currentRoom.room_type_id
      );

      // Prepare updates based on status transition
      let updates: IUpdateRoomAvailabilitiesPayload[] = [];

      if (currentStatus !== "out_of_service" && status === "out_of_service") {
        // Reduce available and total
        updates = availabilities.map((a) => ({
          id: a.id,
          total_rooms: a.total_rooms - 1,
          available_rooms: a.available_rooms - 1,
        }));
      } else if (
        currentStatus === "out_of_service" &&
        status === "in_service"
      ) {
        // Increase available and total
        updates = availabilities.map((a) => ({
          id: a.id,
          total_rooms: a.total_rooms + 1,
          available_rooms: a.available_rooms + 1,
        }));
      }

      if (updates.length > 0) {
        await roomModel.updateInRoomAvailabilities(updates);
      }

      // Update the room status
      await roomModel.updateRoom(roomId, hotel_code, { status });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: `Room status updated to ${status}.`,
      };
    });
  }

  public async deleteHotelRoom(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { room_id } = req.params;
      const { hotel_code } = req.hotel_admin;

      const roomModel = this.Model.RoomModel(trx);

      const roomId = parseInt(room_id);
      const existingRoom = await roomModel.getSingleRoom(hotel_code, roomId);
      if (!existingRoom.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const currentRoom = existingRoom[0];

      // Fetch all availability records for the room's room_type_id (likely per date)
      const availabilities = await roomModel.getRoomAvailabilitiesByRoomTypeId(
        hotel_code,
        currentRoom.room_type_id
      );

      if (availabilities.length > 0) {
        // Prepare updated availability records by decrementing total and available rooms by 1
        const updates = availabilities.map((a) => ({
          id: a.id,
          total_rooms: a.total_rooms - 1,
          available_rooms: a.available_rooms - 1,
        }));

        // Update all availability records in bulk
        await roomModel.updateInRoomAvailabilities(updates);
      }

      // Soft-delete the room by setting is_deleted = true
      await roomModel.updateRoom(roomId, hotel_code, {
        is_deleted: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: `Room has been deleted`,
      };
    });
  }

  public async getAllRoomByRoomType(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const id = req.params.room_type_id;
    const model = this.Model.RoomModel();
    const data = await model.getAllRoomByRoomType(hotel_code, Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      ...data,
    };
  }

  // get all occupied rooms using date
  public async getAllOccupiedRooms(req: Request) {
    const date = req.query.date as string;

    const model = this.Model.RoomModel();

    const data = await model.getAllOccupiedRooms(
      date,
      req.hotel_admin.hotel_code
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      ...data,
    };
  }
}
export default RoomService;
