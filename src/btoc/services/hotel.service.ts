import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  hotelSearchAvailabilityReqPayload,
  IbookingReqPayload,
  recheckReqPayload,
} from "../utills/interfaces/btoc.hotel.interface";
import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";

export class BtocHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async searchAvailability(req: Request) {
    const { hotel_code } = req.web_token;

    const { checkin, checkout, client_nationality, rooms } =
      req.body as hotelSearchAvailabilityReqPayload;

    const nights = HelperFunction.calculateNights(checkin, checkout);
    const getAllAvailableRooms =
      await this.BtocModels.btocReservationModel().getAllRoomRatesBTOC({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data: {
        total: getAllAvailableRooms.length,
        no_of_nights: nights,
        checkin,
        checkout,
        no_of_rooms: rooms.length,
        data: getAllAvailableRooms,
      },
    };
  }

  public async recheck(req: Request) {
    const { hotel_code } = req.web_token;

    const { checkin, checkout, rooms, room_type_id, rate_plan_id } =
      req.body as recheckReqPayload;

    const nights = HelperFunction.calculateNights(checkin, checkout);
    const getAvailableRoom =
      await this.BtocModels.btocReservationModel().recheck({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
        rate_plan_id,
        room_type_id,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data: {
        no_of_nights: nights,
        checkin,
        checkout,
        no_of_rooms: rooms.length,
        data: getAvailableRoom,
      },
    };
  }

  public async booking(req: Request) {
    return this.db.transaction(async (trx) => {
      const {
        hotel_code,
        checkin,
        checkout,
        room_type_id,
        rate_plan_id,
        rooms,
        guest_info,
        special_request,
      } = req.body as IbookingReqPayload;

      const totalRequested = rooms.length;
      const nights = HelperFunction.calculateNights(checkin, checkout);
      const recheck = await this.BtocModels.btocReservationModel().recheck({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
        rate_plan_id,
        room_type_id,
      });

      if (!recheck) {
        throw new Error("Room not available for booking");
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        guest: guest_info,
        room_type: recheck.room_type_name,
        rate_plan: recheck.rate.rate_plan_name,
        total_price: recheck.rate.total_price,
        checkin,
        checkout,
        rooms: rooms.length,
        status: "CONFIRMED",
      };
    });
  }
}
