import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class AdminBtocReservationService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllReservation(req: Request) {
    const {
      search,
      booked_from,
      booked_to,
      booking_type,
      checkin_from,
      checkin_to,
      checkout_from,
      checkout_to,
      limit,
      skip,
      status,
    } = req.query;

    const { data, total } =
      await this.Model.reservationModel().getAllBtocReservation({
        hotel_code: req.hotel_admin.hotel_code,
        search: search as string,
        booked_from: booked_from as string,
        booked_to: booked_to as string,
        booking_type: booking_type as string,
        checkin_from: checkin_from as string,
        checkin_to: checkin_to as string,
        checkout_from: checkout_from as string,
        checkout_to: checkout_to as string,
        limit: limit as string,
        skip: skip as string,
        status: status as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }
}

export default AdminBtocReservationService;
