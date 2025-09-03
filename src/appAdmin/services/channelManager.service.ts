import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IchannelAllocationReqBody } from "../utlis/interfaces/channelManager.types";

class ChannelManagerService extends AbstractServices {
  constructor() {
    super();
  }

  public async addChannelManager(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;

    await this.Model.channelManagerModel().addChannelManager({
      ...req.body,
      hotel_code,
      created_by: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Channel has been added",
    };
  }

  public async getAllChannelManager(req: Request) {
    const data = await this.Model.channelManagerModel().getAllChannelManager({
      hotel_code: req.hotel_admin.hotel_code,
      is_internal: Boolean(req.query.is_internal as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateChannelManager(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;

    await this.Model.channelManagerModel().updateChannelManager(
      {
        ...req.body,
      },
      { id: Number(req.params.id), hotel_code }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Channel has been updated",
    };
  }

  public async channelAllocation(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const {
        channel_id,
        room_type_id,
        total_allocated_rooms,
        from_date,
        to_date,
        rate_plans,
      } = req.body as IchannelAllocationReqBody;

      const cmModel = this.Model.channelManagerModel(trx);
      const settingModel = this.Model.settingModel(trx);
      const reservationModel = this.Model.reservationModel(trx);

      // 1. Validate room type
      const check_room_type_data = await settingModel.getSingleRoomType(
        room_type_id,
        hotel_code
      );
      if (!check_room_type_data.length) throw new Error("Invalid Room Type");

      // 2. Validate channel
      const checkCM = await cmModel.getSingleChannel(channel_id, hotel_code);
      if (!checkCM) throw new Error("Invalid Channel");

      // 3. Validate rate plans
      const checkRatePlans = await settingModel.getAllRoomRateByratePlanIDs({
        hotel_code,
        ids: rate_plans,
      });
      if (checkRatePlans.length !== rate_plans.length)
        throw new Error("Invalid Rate Plans");

      // 4. Prepare dates & allocations
      const channelAllocationPayload: {
        hotel_code: number;
        room_type_id: number;
        channel_id: number;
        date: string;
        allocated_rooms: number;
      }[] = [];

      const roomAvailabilityUpdates: {
        date: string;
        total_rooms: number;
      }[] = [];

      let currentDate = new Date(from_date);
      const endDate = new Date(to_date);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0];

        console.log(formattedDate);
        // 4a. PMS availability check
        const availableRoomCount =
          await cmModel.getAllTodayAvailableRoomsTypeWithRoomCount({
            check_in: formattedDate,
            check_out: formattedDate,
            hotel_code,
            room_type_id,
          });
        console.log({ availableRoomCount });
        if (
          !availableRoomCount.length ||
          availableRoomCount[0].available_rooms < total_allocated_rooms
        )
          throw new Error(
            `Not enough rooms on ${formattedDate}. Requested ${total_allocated_rooms}, only ${
              availableRoomCount[0]?.available_rooms || 0
            } available.`
          );

        // 4b. Merge with existing allocation if exists
        const existingAllocation = await cmModel.getSingleChannelAllocation({
          hotel_code,
          room_type_id,
          channel_id,
          date: formattedDate,
        });

        if (existingAllocation) {
          // update existing allocation
          await cmModel.updateChannelAllocation({
            id: existingAllocation.id,
            allocated_rooms: total_allocated_rooms,
          });

          // here have deallocate
          await cmModel.bulkUpdateRoomAvailabilityForChannel({
            type: "deallocate",
            hotel_code,
            room_type_id,
            updates: [
              {
                date: formattedDate,
                total_rooms: existingAllocation.allocated_rooms,
              },
            ],
          });
        } else {
          // insert new allocation
          channelAllocationPayload.push({
            hotel_code,
            room_type_id,
            channel_id,
            date: formattedDate,
            allocated_rooms: total_allocated_rooms,
          });
        }

        // PMS room availability
        roomAvailabilityUpdates.push({
          date: formattedDate,
          total_rooms: total_allocated_rooms,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 5. Bulk insert new allocations
      if (channelAllocationPayload.length) {
        await cmModel.insertInChannelAllocation(channelAllocationPayload);
      }

      // 6. Bulk update PMS availability
      await cmModel.bulkUpdateRoomAvailabilityForChannel({
        type: "allocate",
        hotel_code,
        room_type_id,
        updates: roomAvailabilityUpdates,
      });

      // 7. Insert/update rate plans mapping
      if (rate_plans.length) {
        const channelRatePlanPayload = rate_plans.map((rp) => ({
          hotel_code,
          room_type_id,
          channel_id,
          rate_plan_id: rp,
        }));
        await cmModel.insertInChannelRatePlans(channelRatePlanPayload);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room allocation successful",
      };
    });
  }

  public async getChannelRoomAllocations(req: Request) {
    const data =
      await this.Model.channelManagerModel().getChannelRoomAllocations({
        current_date: req.query.current_date as string,
        hotel_code: req.hotel_admin.hotel_code,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
export default ChannelManagerService;
