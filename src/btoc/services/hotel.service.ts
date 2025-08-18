import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { hotelSearchAvailabilityReqPayload } from "../utills/interfaces/btoc.hotel.interface";
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

    console.log({ getAllAvailableRooms });
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
}
