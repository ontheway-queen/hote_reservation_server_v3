import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IgetAllRoom } from "../utlis/interfaces/Room.interfaces";
import { Braket } from "aws-sdk";
import { IRoomBookingBody } from "../utlis/interfaces/reservation.interface";

class RoomBookingService extends AbstractServices {
  constructor() {
    super();
  }

  // create room booking
  public async createRoomBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id } = req.hotel_admin;

      const {
        name,
        email,
        phone,
        booking_rooms,
        check_in_time,
        check_out_time,
        discount_amount,
        tax_amount,
        total_occupancy,
        paid_amount,
        payment_type,
        ac_tr_ac_id,
        passport_no,
        nid_no,
        check_in,
        extra_charge,
      } = req.body as IRoomBookingBody;

      // number of nights step
      const checkInTime: any = new Date(check_in_time);
      const checkOutTime: any = new Date(check_out_time);

      const timeDifference = checkOutTime - checkInTime;

      const millisecondsInADay = 24 * 60 * 60 * 1000;
      let numberOfNights = Math.floor(timeDifference / millisecondsInADay);

      if (!numberOfNights) numberOfNights = 1;

      const roomBookingModel = this.Model.roomBookingModel(trx);
      // number of nights end
      const guestModel = this.Model.guestModel(trx);

      const checkUser = await guestModel.getSingleGuest({
        email,
        phone,
        hotel_code,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Room succesfully booked",
      };
    });
  }

  // get all room booking
  public async getAllRoomBooking(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name, from_date, to_date, status, user_id } =
      req.query;

    const model = this.Model.roomBookingModel();

    const { data, total } = await model.getAllRoomBooking({
      limit: limit as string,
      skip: skip as string,
      name: name as string,
      from_date: from_date as string,
      to_date: to_date as string,
      hotel_code,
      status: status as string,
      user_id: user_id as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get single room booking
  public async getSingleRoomBooking(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.roomBookingModel().getSingleRoomBooking(
      parseInt(id),
      hotel_code
    );

    if (!data.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: data,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }
}

export default RoomBookingService;
