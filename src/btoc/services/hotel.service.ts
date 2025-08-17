import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { hotelSearchAvailabilityReqPayload } from "../utills/interfaces/hotel.interface";
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
    const getAllAvailableRoomsWithType =
      await this.BtocModels.btocReservationModel().searchAvailableRoomsBTOC({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
      });

    console.log({ getAllAvailableRoomsWithType });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: getAllAvailableRoomsWithType.length,
      data: getAllAvailableRoomsWithType,
    };
  }
}
