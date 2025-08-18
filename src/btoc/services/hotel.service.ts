import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  hotelSearchAvailabilityReqPayload,
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
}
