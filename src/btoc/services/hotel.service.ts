import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class BtocHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async searchAvailability(req: Request) {
    const { hotel_code } = req.btoc_user;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsWithType =
      await this.Model.reservationModel().calendar({
        hotel_code,
        check_in: check_in as string,
        check_out: check_out as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsWithType,
    };
  }
}
