import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  addPaymentReqBody,
  BookingRequestBody,
  IGBookingRequestBody,
  IguestReqBody,
} from "../utlis/interfaces/reservation.interface";
import { SubReservationService } from "./subreservation.service";
import { IinsertFolioEntriesPayload } from "../utlis/interfaces/invoice.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

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

  public async createBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const body = req.body as BookingRequestBody;

      const sub = new SubReservationService(trx);

      const total_nights = sub.calculateNights(body.check_in, body.check_out);
      if (total_nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Check-in date must be before check-out date",
        };
      }

      // check room type available or not
      body.rooms.forEach(async (room) => {
        const getAllAvailableRoomsWithType = await this.Model.reservationModel(
          trx
        ).getAllAvailableRoomsTypeWithAvailableRoomCount({
          hotel_code,
          check_in: body.check_in,
          check_out: body.check_out,
          room_type_id: room.room_type_id,
        });

        if (
          room.guests.length > getAllAvailableRoomsWithType[0].available_rooms
        ) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room Assigned is more than available rooms",
          };
        }
      });

      // Guest
      const guest_id = await sub.findOrCreateGuest(body.guest, hotel_code);

      // Totals
      const { total_amount } = sub.calculateTotals(body.rooms, total_nights, {
        vat: body.vat,
        service_charge: body.service_charge,
      });

      // Booking
      const booking = await sub.createMainBooking({
        payload: {
          is_individual_booking: body.is_individual_booking,
          check_in: body.check_in,
          check_out: body.check_out,
          created_by: req.hotel_admin.id,
          discount_amount: body.discount_amount,
          drop: body.drop,
          booking_type: body.reservation_type == "booked" ? "B" : "H",
          drop_time: body.drop_time,
          pickup_from: body.pickup_from,
          pickup: body.pickup,
          source_id: body.source_id,
          drop_to: body.drop_to,
          special_requests: body.special_requests,
          vat: body.vat,
          pickup_time: body.pickup_time,
          service_charge: body.service_charge,
          is_company_booked: body.is_company_booked,
          company_name: body.company_name,
          visit_purpose: body.visit_purpose,
        },
        hotel_code,
        guest_id,
        // sub_total,
        total_amount,
        is_checked_in: body.is_checked_in,
        total_nights,
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

      await sub.createRoomBookingFolioWithEntries({
        body,
        guest_id,
        booking_id: booking.id,
        req,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking created successfully",
      };
    });
  }

  public async createGroupBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const body = req.body as IGBookingRequestBody;

      const sub = new SubReservationService(trx);

      const total_nights = sub.calculateNights(body.check_in, body.check_out);
      if (total_nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Check-in date must be before check-out date",
        };
      }

      // check room type available or not
      body.booked_room_types.forEach(async (rt) => {
        const getAllAvailableRoomsWithType = await this.Model.reservationModel(
          trx
        ).getAllAvailableRoomsTypeWithAvailableRoomCount({
          hotel_code,
          check_in: body.check_in,
          check_out: body.check_out,
          room_type_id: rt.room_type_id,
        });

        if (rt.rooms.length > getAllAvailableRoomsWithType[0].available_rooms) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room Assigned is more than available rooms",
          };
        }
      });

      const leadGuest: IguestReqBody =
        body.booked_room_types
          .flatMap((rt) => rt.rooms)
          .flatMap((room) => room.guest_info)
          .find((guest) => guest.is_lead_guest) || ({} as IguestReqBody);

      // Guest
      const guest_id = await sub.findOrCreateGuest(leadGuest, hotel_code);

      // Totals
      const { total_amount } = sub.calculateTotalsForGroupBooking(
        body.booked_room_types,
        total_nights,
        {
          vat: body.vat,
          service_charge: body.service_charge,
        }
      );

      // Booking
      const booking = await sub.createMainBooking({
        payload: {
          is_individual_booking: body.is_individual_booking,
          check_in: body.check_in,
          check_out: body.check_out,
          created_by: req.hotel_admin.id,
          discount_amount: body.discount_amount,
          drop: body.drop,
          booking_type: body.reservation_type == "booked" ? "B" : "H",
          drop_time: body.drop_time,
          pickup_from: body.pickup_from,
          pickup: body.pickup,
          source_id: body.source_id,
          drop_to: body.drop_to,
          special_requests: body.special_requests,
          vat: body.vat,
          pickup_time: body.pickup_time,
          service_charge: body.service_charge,
          is_company_booked: body.is_company_booked,
          company_name: body.company_name,
          visit_purpose: body.visit_purpose,
        },
        hotel_code,
        guest_id,
        // sub_total,
        total_amount,
        is_checked_in: body.is_checked_in,
        total_nights,
      });

      // Rooms
      await sub.insertBookingRoomsForGroupBooking(
        body.booked_room_types,
        booking.id,
        total_nights
      );

      // Availability
      await sub.updateAvailabilityWhenGroupRoomBooking(
        body.reservation_type,
        body.booked_room_types,
        body.check_in,
        body.check_out,
        hotel_code
      );

      await sub.createGroupRoomBookingFolioWithEntries({
        body,
        guest_id,
        booking_id: booking.id,
        req,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking created successfully",
      };
    });
  }

  public async getAllBooking(req: Request) {
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

    const { data, total } = await this.Model.reservationModel().getAllBooking({
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

  public async getArrivalDepStayBookings(req: Request) {
    const { data, total } =
      await this.Model.reservationModel().getArrivalDepStayBookings({
        hotel_code: req.hotel_admin.hotel_code,
        booking_mode: req.query.booking_mode as any,
        limit: req.query.limit as string,
        skip: req.query.skip as string,
        search: req.query.search as string,
        current_date: req.query.current_date as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
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

  public async changeDatesOfBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { check_in, check_out } = req.body;
      const booking_id = parseInt(req.params.id);

      const reservationModel = this.Model.reservationModel(trx);
      const invoiceModel = this.Model.hotelInvoiceModel(trx);

      const booking = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const {
        booking_rooms,
        check_in: prev_checkin,
        check_out: prev_checkout,
        vat,
        discount_amount,
        service_charge,
      } = booking;

      // Prevent changing to the same dates
      if (prev_checkin === check_in && prev_checkout === check_out) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "You have requested previous date",
        };
      }

      // Check availability grouped by room type
      const roomTypeMap = new Map<number, number>();
      for (const room of booking_rooms) {
        roomTypeMap.set(
          room.room_type_id,
          (roomTypeMap.get(room.room_type_id) || 0) + 1
        );
      }

      for (const [room_type_id, total_rooms] of roomTypeMap.entries()) {
        const available =
          await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
            {
              hotel_code,
              check_in,
              check_out,
              room_type_id,
            }
          );

        if (available.length && total_rooms > available[0].available_rooms) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room Assigned is more than available rooms",
          };
        }
      }

      // Recalculate totals
      const sub = new SubReservationService(trx);
      const total_nights = sub.calculateNights(check_in, check_out);

      const { total_amount } = sub.calculateTotalsByBookingRooms(
        booking_rooms,
        total_nights
      );

      console.log({ total_amount, booking_id, hotel_code });

      // Update booking totals
      await reservationModel.updateRoomBooking(
        { total_amount, total_nights, check_out, check_in },
        hotel_code,
        booking_id
      );

      // Update booking rooms
      const roomIDs = booking_rooms.map((room) => room.room_id);
      await reservationModel.deleteBookingRooms(roomIDs);
      await sub.insertInBookingRoomsBySingleBookingRooms(
        booking_rooms,
        booking_id,
        total_nights
      );

      // Update room availability
      await sub.updateRoomAvailabilityService(
        "booked_room_decrease",
        booking_rooms,
        prev_checkin,
        prev_checkout,
        hotel_code
      );

      await sub.updateRoomAvailabilityService(
        "booked_room_increase",
        booking_rooms,
        check_in,
        check_out,
        hotel_code
      );

      // Handle folio entries
      const folioEntries = await invoiceModel.getFoliosEntriesbySingleBooking({
        booking_id,
        hotel_code,
        type: "primary",
      });

      if (!folioEntries.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "No folio entries found.",
        };
      }

      const folio_id = folioEntries[0].id;
      const entryIds = folioEntries.map((entry) => entry.entries_id);
      const hasPayment = folioEntries.some(
        (entry) => entry.posting_type.toLowerCase() === "payment"
      );

      // Mark all old entries as void
      await invoiceModel.updateFolioEntries({ is_void: true }, entryIds);

      if (hasPayment) {
        // Insert reversal entries
        const reversals: IinsertFolioEntriesPayload[] = folioEntries
          .filter((entry) => entry.posting_type.toLowerCase() === "charge")
          .map((entry) => ({
            debit: -entry.debit,
            credit: 0,
            folio_id,
            posting_type: "Charge",
            description: "Reversed previous room charge due to date change",
          }));
        if (reversals.length) {
          await invoiceModel.insertInFolioEntries(reversals);
        }
      }

      // Insert new charge entry
      await invoiceModel.insertInFolioEntries({
        debit: total_amount,
        folio_id,
        posting_type: "Charge",
        description: "New room charge after date change",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "The dates of the reservation have been modified",
      };
    });
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

      // if (checkDueAmount > 0) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
      //     message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
      //   };
      // }

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

      console.log(req.body, "hold body");
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
            status: "confirmed",
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
        // update
        await this.Model.reservationModel().updateRoomBooking(
          {
            booking_type: "H",
            status: "canceled",
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
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully updated",
      };
    });
  }

  public async getFoliosbySingleBooking(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getFoliosbySingleBooking(
      req.hotel_admin.hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getFoliosWithEntriesbySingleBooking(req: Request) {
    const data =
      await this.Model.hotelInvoiceModel().getFoliosWithEntriesbySingleBooking({
        hotel_code: req.hotel_admin.hotel_code,
        booking_id: parseInt(req.params.id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getFolioEntriesbyFolioID(req: Request) {
    const data = await this.Model.hotelInvoiceModel().getFolioEntriesbyFolioID(
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

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
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
        payment_for: "ADD MONEY",
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

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
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

  public async adjustAmountByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
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

      await this.Model.hotelInvoiceModel().insertInFolioEntries({
        debit: -amount,
        credit: 0,
        folio_id: folio_id,
        posting_type: "Adjustment",
        description: remarks,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async addItemByFolioID(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { amount, folio_id, remarks } = req.body as addPaymentReqBody;

      const invModel = this.Model.hotelInvoiceModel(trx);
      const checkSingleFolio =
        await invModel.getSingleFoliobyHotelCodeAndFolioID(
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

      await this.Model.hotelInvoiceModel().insertInFolioEntries({
        debit: amount,
        folio_id: folio_id,
        posting_type: "Charge",
        description: remarks,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
export default ReservationService;
