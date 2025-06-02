import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  addPaymentReqBody,
  BookingRequestBody,
  IbookingRooms,
  IgetChildRateGroups,
  ISearchAvailableRoom,
} from "../utlis/interfaces/reservation.interface";
import Lib from "../../utils/lib/lib";
import { HelperFunction } from "../utlis/library/helperFunction";
import { SubReservationService } from "./subreservation.service";

export class ReservationService extends AbstractServices {
  constructor() {
    super();
  }

  public async calendar(req: Request) {
    const { hotel_code } = req.hotel_admin;

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

  public async getAllAvailableRoomsTypeWithAvailableRoomCount(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsWithType =
      await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
        {
          hotel_code,
          check_in: check_in as string,
          check_out: check_out as string,
        }
      );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsWithType,
    };
  }

  public async getAllAvailableRoomsTypeForEachDateAvailableRoom(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsWithType =
      await this.Model.reservationModel().getAllAvailableRoomsTypeForEachAvailableRoom(
        {
          hotel_code,
          check_in: check_in as string,
          check_out: check_out as string,
        }
      );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsWithType,
    };
  }

  public async getAllAvailableRoomsByRoomType(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { check_in, check_out } = req.query;

    const getAllAvailableRoomsByRoomType =
      await this.Model.reservationModel().getAllAvailableRoomsByRoomType({
        hotel_code,
        check_in: check_in as string,
        check_out: check_out as string,
        room_type_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: getAllAvailableRoomsByRoomType,
    };
  }

  // public async createBooking(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const { hotel_code, hotel_name } = req.hotel_admin;

  //     const {
  //       check_in,
  //       check_out,
  //       rooms,
  //       special_requests,
  //       source_id,
  //       discount_amount,
  //       drop,
  //       guest,
  //       payment,
  //       pickup,
  //       reservation_type,
  //       service_charge,
  //       vat,
  //       drop_time,
  //       drop_to,
  //       pickup_from,
  //       pickup_time,
  //       is_checked_in,
  //     } = req.body as BookingRequestBody;

  //     const total_nights = Lib.calculateNights(check_in, check_out);

  //     const reservation_model = this.Model.reservationModel(trx);

  //     if (reservation_type == "confirm") {
  //       let total_room_rent = 0;

  //       let total_changed_price = 0;

  //       const changeRateRooms: {
  //         room_type_id: number;
  //         rate_plan_id: number;
  //         rate: {
  //           base_price: number;
  //           changed_price: number;
  //         };
  //       }[] = [];

  //       // finding total price
  //       rooms.forEach((room) => {
  //         total_room_rent += room.rate.base_price * room.number_of_rooms;
  //         total_changed_price += room.rate.changed_price * room.number_of_rooms;
  //       });

  //       const total_amount =
  //         total_changed_price * total_nights +
  //         vat +
  //         service_charge -
  //         discount_amount;
  //       const sub_total =
  //         total_changed_price * total_nights + vat + service_charge;

  //       // create guest
  //       const guestModel = this.Model.guestModel(trx);

  //       // check guest
  //       const { data: checkGuest } = await guestModel.getAllGuest({
  //         email: guest.email,
  //         hotel_code,
  //       });
  //       let guestID = checkGuest?.length && checkGuest[0].id;

  //       if (!checkGuest.length) {
  //         const insertGuestRes = await guestModel.createGuest({
  //           hotel_code,
  //           first_name: guest.first_name,
  //           last_name: guest.last_name,
  //           nationality: guest.nationality,
  //           email: guest.email,
  //           phone: guest.phone,
  //         });

  //         guestID = insertGuestRes[0].id;
  //       }

  //       // ---------------- booking ------------//

  //       const getLastBooking = await reservation_model.getLastBooking();
  //       const lastbookingId = getLastBooking?.length ? getLastBooking[0].id : 1;

  //       const ref = Lib.generateBookingReferenceWithId(`BK`, lastbookingId);

  //       const bookingRes = await reservation_model.insertRoomBooking({
  //         booking_date: new Date().toLocaleDateString(),
  //         booking_reference: ref,
  //         check_in,
  //         check_out,
  //         guest_id: guestID,
  //         hotel_code,
  //         sub_total: sub_total,
  //         status: is_checked_in ? "checked_in" : "confirmed",
  //         vat,
  //         service_charge,
  //         total_amount: total_amount,
  //         discount_amount,
  //         created_by: req.hotel_admin.id,
  //         comments: special_requests,
  //         source_id,
  //         drop,
  //         drop_time,
  //         drop_to,
  //         pickup,
  //         pickup_from,
  //         pickup_time,
  //       });

  // const bookingRoomsPayload: IbookingRooms[] = [];

  //       rooms.forEach((room) => {
  //         const base_rate = room.rate.base_price * total_nights;
  //         const changed_rate = room.rate.changed_price * total_nights;

  //         room.guests.forEach((guest) => {
  //           bookingRoomsPayload.push({
  //             booking_id: bookingRes[0].id,
  //             adults: guest.adults,
  //             children: guest.children,
  //             base_rate: base_rate,
  //             changed_rate,
  //             infant: guest.infant,
  //             room_id: guest.room_id,
  //             room_type_id: room.room_type_id,
  //           });
  //         });
  //       });

  //       // insert booking rooms
  //       await reservation_model.insertBookingRoom(bookingRoomsPayload);

  //       // Get all dates between check_in (inclusive) and check_out (exclusive)
  //       const dates = HelperFunction.getDatesBetween(check_in, check_out);

  //       console.log({ dates });

  //       // Sum total rooms reserved per room_type_id
  //       const reservedRoom = rooms.map((item) => ({
  //         room_type_id: item.room_type_id,
  //         total_room: item.guests.length,
  //       }));

  //       // Update availability per date and room_type_id
  //       for (const { room_type_id, total_room } of reservedRoom) {
  //         for (const date of dates) {
  //           await reservation_model.updateRoomAvailability({
  //             hotel_code,
  //             room_type_id,
  //             date,
  //             rooms_to_book: total_room,
  //           });
  //         }
  //       }

  //       // ------------- payment ---------------//
  //       const accountModel = this.Model.accountModel(trx);

  //       const checkAccount = await accountModel.getSingleAccount({
  //         hotel_code,
  //         id: payment.acc_id,
  //       });

  //       if (!checkAccount.length) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_NOT_FOUND,
  //           message: "Invalid Account",
  //         };
  //       }

  //       const generatedVoucher = await new HelperFunction().generateVoucherNo();

  //       const accountVoucherRes = await accountModel.insertAccVoucher({
  //         acc_head_id: checkAccount[0].acc_head_id,
  //         created_by: req.hotel_admin.id,
  //         debit: payment.amount,
  //         credit: 0,
  //         description: "For room booking payment",
  //         payment_type: "PAYMENT",
  //         voucher_date: new Date().toISOString(),
  //         voucher_no: generatedVoucher,
  //         payment_method: "Bank",
  //       });

  //       const hotelInvModel = this.Model.hotelInvoiceModel(trx);

  //       const getLastFolioId = await hotelInvModel.getLasFolioId();

  //       const generatedFolioNumber = HelperFunction.generateFolioNumber(
  //         getLastFolioId[0]?.id
  //       );

  //       const folioRes = await hotelInvModel.insertInFolio({
  //         folio_number: generatedFolioNumber,
  //         guest_id: guestID,
  //         hotel_code,
  //         name: "Room Booking",
  //         status: "open",
  //         type: "Primary",
  //       });

  //       await hotelInvModel.insertInFolioEntries({
  //         acc_voucher_id: accountVoucherRes[0].id,
  //         debit: total_amount,
  //         credit: 0,
  //         folio_id: folioRes[0].id,
  //         posting_type: "Charge",
  //         status: "open",
  //       });

  //       await hotelInvModel.insertInFolioEntries({
  //         acc_voucher_id: accountVoucherRes[0].id,
  //         debit: 0,
  //         credit: payment.amount,
  //         folio_id: folioRes[0].id,
  //         posting_type: "Charge",
  //         status: "open",
  //       });

  //       // guest ledger
  //       await this.Model.guestModel().insertGuestLedger({
  //         hotel_code,
  //         credit: payment.amount,
  //         debit: 0,
  //         guest_id: guestID,
  //       });

  //       await this.Model.guestModel().insertGuestLedger({
  //         hotel_code,
  //         credit: 0,
  //         debit: total_amount,
  //         guest_id: guestID,
  //       });
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       data: { message: "Booking created successfully" },
  //     };
  //   });
  // }

  public async createBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const body = req.body as BookingRequestBody;

      const sub = new SubReservationService(trx);

      const total_nights = sub.calculateNights(body.check_in, body.check_out);

      // Guest
      const guest_id = await sub.findOrCreateGuest(body.guest, hotel_code);

      // Totals
      const { total_amount, sub_total } = sub.calculateTotals(
        body.rooms,
        total_nights,
        {
          vat: body.vat,
          service_charge: body.service_charge,
          discount: body.discount_amount,
        }
      );

      // Booking
      const booking = await sub.createMainBooking({
        payload: {
          check_in: body.check_in,
          check_out: body.check_out,
          created_by: req.hotel_admin.id,
          discount_amount: body.discount_amount,
          drop: body.drop,
          booking_type: body.reservation_type == "confirm" ? "B" : "H",
          drop_time: body.drop_time,
          pickup_from: body.pickup_from,
          pickup: body.pickup,
          source_id: body.source_id,
          drop_to: body.drop_to,
          special_requests: body.special_requests,
          vat: body.vat,
          pickup_time: body.pickup_time,
          service_charge: body.service_charge,
        },
        hotel_code,
        guest_id,
        sub_total,
        total_amount,
        is_checked_in: body.is_checked_in,
      });

      // Rooms
      await sub.insertBookingRooms(body.rooms, booking.id, total_nights);

      // Availability
      await sub.updateAvailabilityWhenRoomBooking(
        body.reservation_type,
        body.rooms,
        body.check_in,
        body.check_out,
        hotel_code
      );

      // Payment
      await sub.handlePaymentAndFolioForBooking(
        body.is_payment_given,
        body.payment,
        guest_id,
        req,
        total_amount,
        booking.id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking created successfully",
      };
    });
  }

  public async getAllBooking(req: Request) {
    const data = await this.Model.reservationModel().getAllBooking({
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getSingleBooking(req: Request) {
    const data = await this.Model.reservationModel().getSingleBooking(
      req.hotel_admin.hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSingleBooking(req: Request) {
    const checkSingleBooking =
      await this.Model.reservationModel().getSingleBooking(
        req.hotel_admin.hotel_code,
        parseInt(req.params.id)
      );

    if (!checkSingleBooking) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      // data,
    };
  }

  public async checkIn(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;
    const booking_id = parseInt(req.params.id);
    const data = await this.Model.reservationModel().getSingleBooking(
      hotel_code,
      booking_id
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { status } = data;

    if (status != "confirmed") {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "This booking has other status. So, you cannot checkin",
      };
    }

    // update
    await this.Model.reservationModel().updateRoomBooking(
      {
        status: "checked_in",
      },
      hotel_code,
      booking_id
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Successfully Cheked in",
    };
  }

  public async checkOut(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const booking_id = parseInt(req.params.id);

      const reservationModel = this.Model.reservationModel(trx);
      const sub = new SubReservationService(trx);

      const data = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { status, booking_type, booking_rooms, check_in, check_out } = data;

      if (booking_type != "B" && status != "checked_in") {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "This booking has other status. So, you cannot checkout",
        };
      }

      // check  due balance exist or not
      const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);

      const checkDueAmount = await hotelInvoiceModel.getDueAmountByBookingID({
        booking_id,
        hotel_code,
      });

      console.log({ checkDueAmount });

      if (checkDueAmount > 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
        };
      }

      // room avaibility decrease
      await sub.updateRoomAvailabilityService(
        "booked_room_decrease",
        booking_rooms,
        check_in,
        check_out,
        hotel_code
      );

      // update
      await reservationModel.updateRoomBooking(
        {
          status: "checked_out",
        },
        hotel_code,
        booking_id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Cheked out",
      };
    });
  }

  public async updateReservationHoldStatus(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const booking_id = parseInt(req.params.id);

      const { status: reservation_type_status } = req.body;

      const sub = new SubReservationService(trx);

      const data = await this.Model.reservationModel().getSingleBooking(
        hotel_code,
        booking_id
      );

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { booking_type, status, booking_rooms, check_in, check_out } = data;

      if (booking_type != "H" && status !== "confirmed") {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "This booking has other status. So, you cannot changed",
        };
      }

      if (reservation_type_status == "confirmed") {
        // update
        await this.Model.reservationModel().updateRoomBooking(
          {
            booking_type: "B",
          },
          hotel_code,
          booking_id
        );
        // Availability
        await sub.updateRoomAvailabilityForHoldService(
          "hold_decrease",
          booking_rooms,
          check_in,
          check_out,
          hotel_code
        );

        await sub.updateRoomAvailabilityService(
          "booked_room_increase",
          booking_rooms,
          check_in,
          check_out,
          hotel_code
        );

        // update room availability
      } else if (reservation_type_status == "canceled") {
        // Availability
        await sub.updateRoomAvailabilityForHoldService(
          "hold_decrease",
          booking_rooms,
          check_in,
          check_out,
          hotel_code
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully updated",
      };
    });
  }

  public async getFoliosbySingleBooking(req: Request) {
    const data = await this.Model.reservationModel().getFoliosbySingleBooking(
      req.hotel_admin.hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getFolioEntriesbyFolioID(req: Request) {
    const data = await this.Model.reservationModel().getFolioEntriesbyFolioID(
      req.hotel_admin.hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async addPaymentByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { acc_id, amount, folio_id, payment_date, remarks } =
        req.body as addPaymentReqBody;
      const sub = new SubReservationService(trx);

      const reservationModel = this.Model.reservationModel(trx);
      const checkSingleFolio =
        await reservationModel.getSingleFoliobyHotelCodeAndID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // insert entries
      await sub.handlePaymentAndFolioForAddPayment({
        acc_id,
        amount,
        folio_id,
        guest_id: checkSingleFolio.guest_id,
        payment_for: "ADD MONEY.",
        remarks,
        req,
        payment_date,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Payment has been added",
      };
    });
  }

  public async refundPaymentByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { acc_id, amount, folio_id, payment_date, payment_type, remarks } =
        req.body as addPaymentReqBody;
      const sub = new SubReservationService(trx);

      const reservationModel = this.Model.reservationModel(trx);
      const checkSingleFolio =
        await reservationModel.getSingleFoliobyHotelCodeAndID(
          req.hotel_admin.hotel_code,
          folio_id
        );

      if (!checkSingleFolio) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // insert entries
      await sub.handlePaymentAndFolioForRefundPayment({
        acc_id,
        amount,
        folio_id,
        guest_id: checkSingleFolio.guest_id,
        payment_for: "REFUND",
        remarks,
        req,
        payment_date,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Payment has been refunded",
      };
    });
  }
}
export default ReservationService;
