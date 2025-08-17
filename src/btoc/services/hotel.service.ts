import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { hotelSearchAvailabilityReqPayload } from "../utills/interfaces/hotel.interface";

export class BtocHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async searchAvailability(req: Request) {
    const { hotel_code } = req.web_token;

    const { checkin, checkout, client_nationality, rooms } =
      req.body as hotelSearchAvailabilityReqPayload;

    const getAllAvailableRoomsWithType =
      await this.BtocModels.btocReservationModel().searchAvailableRoomsBTOC({
        hotel_code,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
      });

    console.log({ getAllAvailableRoomsWithType });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsWithType,
    };
  }
}
