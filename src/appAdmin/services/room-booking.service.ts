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

  // insert check in room booking
  public async insertBookingCheckIn(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id } = req.hotel_admin;
      const { booking_id, check_in } = req.body;

      const bookingModel = this.Model.roomBookingModel(trx);

      const checkBooking = await bookingModel.getSingleRoomBooking(
        booking_id,
        hotel_code
      );

      if (!checkBooking.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Booking not found",
        };
      }

      // check already checked in or not with this booking id
      const { data: checkBookingCheckedIn } =
        await bookingModel.getAllRoomBookingCheckIn({ booking_id, hotel_code });

      if (checkBookingCheckedIn.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Already checked in by this booking ID",
        };
      }

      const { check_out_time, pay_status, grand_total, user_id, booking_no } =
        checkBooking[0];

      // room booking check in time
      const rmb_last_check_in_time = new Date(check_out_time);
      const after_rmb_check_in_time = new Date(check_in);

      if (after_rmb_check_in_time > rmb_last_check_in_time) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            "Room booking check in time expired, so you can not check in for this booking",
        };
      }

      if (!pay_status) {
        const guestModel = this.Model.guestModel(trx);

        await guestModel.insertGuestLedger({
          name: booking_no,
          amount: grand_total,
          pay_type: "debit",
          user_id,
          hotel_code,
        });

        const roomBookingModel = this.Model.roomBookingModel(trx);

        await roomBookingModel.updateRoomBooking(
          { pay_status: 1, reserved_room: 1 },
          { id: booking_id }
        );
      }

      // insert room booking check in
      await bookingModel.insertRoomBookingCheckIn({
        booking_id,
        check_in,
        created_by: id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking checked in",
      };
    });
  }

  // get all room booking check in
  public async getAllRoomBookingCheckIn(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, from_date, to_date } = req.query;

    const model = this.Model.roomBookingModel();

    const { data, total } = await model.getAllRoomBookingCheckIn({
      limit: limit as string,
      skip: skip as string,
      hotel_code,
      key: key as string,
      from_date: from_date as string,
      to_date: to_date as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }
}

export default RoomBookingService;
