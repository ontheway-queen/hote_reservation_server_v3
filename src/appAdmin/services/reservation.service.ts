import { Request } from "express";
import {
  addPaymentReqBody,
  BookingRoom,
  IGBookingRequestBody,
} from "../utlis/interfaces/reservation.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

import { SubReservationService } from "./subreservation.service";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";
import CustomError from "../../utils/lib/customEror";

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
      const body = req.body as IGBookingRequestBody;

      const {
        check_in,
        check_out,
        booked_room_types,
        vat,
        service_charge,
        is_individual_booking,
        reservation_type,
        discount_amount,
        pickup,
        drop,
        drop_time,
        pickup_time,
        pickup_from,
        drop_to,
        source_id,
        special_requests,
        is_company_booked,
        company_name,
        visit_purpose,
        is_checked_in,
        service_charge_percentage,
        vat_percentage,
      } = body;

      const sub = new SubReservationService(trx);

      // Calculate total nights
      const total_nights = sub.calculateNights(check_in, check_out);
      if (total_nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Check-in date must be before check-out date",
        };
      }

      const reservationModel = this.Model.reservationModel(trx);

      // Validate room availability
      for (const rt of booked_room_types) {
        // check how many rooms available by room types
        const availableRooms =
          await reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount(
            {
              hotel_code,
              check_in,
              check_out,
              room_type_id: rt.room_type_id,
            }
          );

        if (rt.rooms.length > (availableRooms[0]?.available_rooms || 0)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room Assigned is more than available rooms",
          };
        }

        // check rooms available or not
        const availableRoomList =
          await reservationModel.getAllAvailableRoomsByRoomType({
            hotel_code,
            check_in,
            check_out,
            room_type_id: rt.room_type_id,
          });

        for (const room of rt.rooms) {
          const isRoomAvailable = availableRoomList.some((avr) => {
            return avr.room_id === room.room_id;
          });

          if (!isRoomAvailable) {
            // get single room which is not available
            const getSingleRoom = await this.Model.RoomModel().getSingleRoom(
              hotel_code,
              room.room_id
            );

            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: `Room No ${getSingleRoom[0]?.room_name} not available`,
            };
          }
        }
      }

      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(
        body.lead_guest_info,
        hotel_code
      );

      // Create main booking
      const booking = await sub.createMainBooking({
        payload: {
          is_individual_booking,
          check_in,
          check_out,
          created_by: req.hotel_admin.id,
          discount_amount,
          drop,
          booking_type: reservation_type === "booked" ? "B" : "H",
          drop_time,
          pickup_from,
          pickup,
          source_id,
          drop_to,
          special_requests,
          vat,
          pickup_time,
          service_charge,
          is_company_booked,
          company_name,
          visit_purpose,
          service_charge_percentage,
          vat_percentage,
        },
        hotel_code,
        guest_id,
        is_checked_in,
        total_nights,
      });

      // Insert booking rooms
      await sub.insertBookingRooms({
        booked_room_types,
        booking_id: booking.id,
        nights: total_nights,
        hotel_code,
        is_checked_in,
      });

      // Update availability
      await sub.updateAvailabilityWhenRoomBooking(
        reservation_type,
        booked_room_types,
        hotel_code
      );

      // Create folio and ledger entries
      await sub.createRoomBookingFolioWithEntries({
        body,
        guest_id,
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        req,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking created successfully",
        data: {
          booking_id: booking.id,
        },
      };
    });
  }

  public async createGroupBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const body = req.body as IGBookingRequestBody;

      const {
        check_in,
        check_out,
        booked_room_types,
        vat,
        service_charge,
        is_individual_booking,
        reservation_type,
        discount_amount,
        pickup,
        drop,
        drop_time,
        pickup_time,
        pickup_from,
        drop_to,
        source_id,
        special_requests,
        is_company_booked,
        company_name,
        visit_purpose,
        is_checked_in,
        service_charge_percentage,
        vat_percentage,
      } = body;

      const sub = new SubReservationService(trx);

      // Calculate total nights
      const total_nights = sub.calculateNights(check_in, check_out);
      if (total_nights <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Check-in date must be before check-out date",
        };
      }
      const reservationModel = this.Model.reservationModel(trx);
      // Validate room availability
      for (const rt of booked_room_types) {
        const availableRooms =
          await reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount(
            {
              hotel_code,
              check_in,
              check_out,
              room_type_id: rt.room_type_id,
            }
          );

        if (rt.rooms.length > (availableRooms[0]?.available_rooms || 0)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Room Assigned is more than available rooms",
          };
        }

        // check rooms available or not
        const availableRoomList =
          await reservationModel.getAllAvailableRoomsByRoomType({
            hotel_code,
            check_in,
            check_out,
            room_type_id: rt.room_type_id,
          });

        for (const room of rt.rooms) {
          const isRoomAvailable = availableRoomList.some((avr) => {
            return avr.room_id === room.room_id;
          });

          // get single room which is not available
          const getSingleRoom = await this.Model.RoomModel().getSingleRoom(
            hotel_code,
            room.room_id
          );

          if (!isRoomAvailable) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: `Room No ${getSingleRoom[0]?.room_name} not available`,
            };
          }
        }
      }

      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(
        body.lead_guest_info,
        hotel_code
      );

      // Create main booking
      const booking = await sub.createMainBooking({
        payload: {
          is_individual_booking,
          check_in,
          check_out,
          created_by: req.hotel_admin.id,
          discount_amount,
          drop,
          booking_type: reservation_type === "booked" ? "B" : "H",
          drop_time,
          pickup_from,
          pickup,
          source_id,
          drop_to,
          special_requests,
          vat,
          pickup_time,
          service_charge,
          is_company_booked,
          company_name,
          visit_purpose,
          service_charge_percentage,
          vat_percentage,
        },
        hotel_code,
        guest_id,
        is_checked_in,
        total_nights,
      });

      // Insert booking rooms
      await sub.insertBookingRoomsForGroupBooking({
        booked_room_types,
        booking_id: booking.id,
        hotel_code,
        is_checked_in,
      });

      // Update availability
      await sub.updateAvailabilityWhenRoomBooking(
        reservation_type,
        booked_room_types,
        hotel_code
      );

      // Create folio and ledger entries
      await sub.createGroupRoomBookingFolios({
        body,
        guest_id,
        booking_id: booking.id,
        req,
        booking_ref: booking.booking_ref,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking created successfully",
        data: {
          booking_id: booking.id,
        },
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
    console.log({ status });
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
      status: status as string[],
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getAllIndividualBooking(req: Request) {
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
      await this.Model.reservationModel().getAllIndividualBooking({
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

  public async getAllGroupBooking(req: Request) {
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
      await this.Model.reservationModel().getAllGroupBooking({
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

  public async cancelBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const created_by = req.hotel_admin.id;
      const booking_id = parseInt(req.params.id);

      const reservationModel = this.Model.reservationModel(trx);
      const invModel = this.Model.hotelInvoiceModel(trx);
      const booking = await reservationModel.getSingleBooking(
        req.hotel_admin.hotel_code,
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
        voucher_no,
        booking_reference: booking_ref,
      } = booking;

      // update booking by Booking Type C
      await reservationModel.updateRoomBooking(
        { booking_type: "C" },
        hotel_code,
        booking_id
      );
      const sub = new SubReservationService(trx);

      // update availability
      const remainCheckOutRooms: BookingRoom[] = booking_rooms?.filter(
        (room) => room.status !== "checked_out"
      );

      if (remainCheckOutRooms?.length) {
        await sub.updateRoomAvailabilityService({
          reservation_type: "booked_room_decrease",
          rooms: remainCheckOutRooms,
          hotel_code,
        });
      }

      // Accounting
      const { total_debit, total_credit } =
        await invModel.getFolioEntriesCalculationByBookingID({
          hotel_code,
          booking_id,
        });

      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);
      const accountModel = this.Model.accountModel(trx);
      const today = new Date().toISOString().split("T")[0];

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "RECEIVABLE_HEAD_ID",
        "HOTEL_REVENUE_HEAD_ID",
      ]);

      const voucher_no1 = await helper.generateVoucherNo("JV", trx);
      console.log({ heads, hotel_code });

      const receivable_head = heads.find(
        (h) => h.config === "RECEIVABLE_HEAD_ID"
      );

      if (!receivable_head) {
        throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );
      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      await accountModel.insertAccVoucher([
        {
          acc_head_id: receivable_head.head_id,
          created_by,
          debit: 0,
          credit: total_debit - total_credit,
          description: `Receivable for Cancel a reservation. Booking Ref ${booking_ref}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
        {
          acc_head_id: sales_head.head_id,
          created_by,
          debit: total_debit - total_credit,
          credit: 0,
          description: `Sales for Cancel a reservation ${booking_ref}`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Canceled",
      };
    });
  }

  public async checkIn(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;
    const booking_id = parseInt(req.params.id);
    const model = this.Model.reservationModel();
    const data = await model.getSingleBooking(hotel_code, booking_id);

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { status, check_in } = data;

    if (status != "confirmed") {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: "This booking has other status. So, you cannot checkin",
      };
    }

    if (check_in > new Date().toISOString()) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: `You can only check in when the check-in date is or after ${check_in}`,
      };
    }

    // update
    await model.updateRoomBooking(
      {
        status: "checked_in",
      },
      hotel_code,
      booking_id
    );

    // update booking rooms
    await model.updateAllBookingRoomsByBookingID(
      { status: "checked_in", checked_in_at: new Date().toISOString() },
      { booking_id, exclude_checkout: true }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Successfully Cheked in",
    };
  }

  public async individualRoomCheckIn(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;
    const booking_id = parseInt(req.params.id);
    const model = this.Model.reservationModel();
    const data = await model.getSingleBooking(hotel_code, booking_id);

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    if (data.check_in > new Date().toISOString()) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: `You can only check in when the check-in date is or after ${data.check_in}`,
      };
    }

    // update booking rooms
    await model.updateSingleBookingRoom(
      { status: "checked_in", checked_in_at: new Date().toISOString() },
      { booking_id, room_id: Number(req.params.room_id) }
    );

    // check all booking rooms are check in or not
    const getSingleBookingRoom = await model.getSingleBooking(
      hotel_code,
      booking_id
    );

    if (getSingleBookingRoom) {
      const { booking_rooms } = getSingleBookingRoom;

      const isAllCheckIn = booking_rooms.every(
        (room) => room.status === "checked_in"
      );

      if (isAllCheckIn) {
        // update main booking
        await model.updateRoomBooking(
          { status: "checked_in" },
          hotel_code,
          booking_id
        );
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Successfully Cheked in",
    };
  }

  // public async checkOut(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const hotel_code = req.hotel_admin.hotel_code;
  //     const booking_id = parseInt(req.params.id);

  //     const reservationModel = this.Model.reservationModel(trx);
  //     const sub = new SubReservationService(trx);

  //     const data = await reservationModel.getSingleBooking(
  //       hotel_code,
  //       booking_id
  //     );

  //     if (!data) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: this.ResMsg.HTTP_NOT_FOUND,
  //       };
  //     }

  //     const { status, booking_type, booking_rooms, check_in, check_out } = data;

  //     if (booking_type != "B" && status != "checked_in") {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "This booking has other status. So, you cannot checkout",
  //       };
  //     }

  //     if (check_out > new Date().toISOString()) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: `You can only check out when the check-out date is or after ${check_out}`,
  //       };
  //     }

  //     const remainCheckOutRooms: BookingRoom[] = booking_rooms?.filter(
  //       (room) => room.status !== "checked_out"
  //     );

  //     if (remainCheckOutRooms?.length) {
  //       await sub.updateRoomAvailabilityService({
  //         reservation_type: "booked_room_decrease",
  //         rooms: remainCheckOutRooms,
  //         hotel_code,
  //       });
  //     }

  //     // update reservation
  //     await reservationModel.updateRoomBooking(
  //       {
  //         status: "checked_out",
  //       },
  //       hotel_code,
  //       booking_id
  //     );

  //     // update booking rooms status
  //     await reservationModel.updateAllBookingRoomsByBookingID(
  //       { status: "checked_out", checked_out_at: new Date().toISOString() },
  //       { booking_id }
  //     );

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_OK,
  //       message: "Successfully Checked out",
  //     };
  //   });
  // }

  // modified for all check out for 1 night
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

      const totalNights = Lib.calculateNights(check_in, check_out);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(check_out);
      checkOutDate.setHours(0, 0, 0, 0);

      const dayBeforeCheckout = new Date(checkOutDate);
      dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);

      if (totalNights > 1) {
        if (new Date(check_out) > new Date()) {
          console.log("first");
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `You can only check out on or after ${check_out}`,
          };
        }
      } else {
        // logic for same day checkin checkout if 1 night stay, can checkout on check-out date or previous day
        if (
          totalNights == 1 &&
          checkOutDate.getTime() !== today.getTime() &&
          dayBeforeCheckout.getTime() !== today.getTime()
        ) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `You can only check out on or after ${check_out}`,
          };
        }
      }

      // if booking room check_in and check_out are different from main booking check_in and check_out
      // then cannot checkout all rooms together
      booking_rooms?.forEach((room) => {
        console.log(room.check_in, room.check_out, "room");
        if (
          (check_in != room.check_in && check_out != room.check_out) ||
          (room.check_in == check_in && check_out != room.check_out) ||
          (check_in != room.check_in && room.check_out == check_out)
        ) {
          throw new CustomError(
            `Because each room has a different check-in and check-out date, you are unable to check out every room. Please check out each room separately.`,
            this.StatusCode.HTTP_BAD_REQUEST
          );
        }
      });

      const remainCheckOutRooms: BookingRoom[] = booking_rooms?.filter(
        (room) => room.status !== "checked_out"
      );

      if (remainCheckOutRooms?.length) {
        await sub.updateRoomAvailabilityService({
          reservation_type: "booked_room_decrease",
          rooms: remainCheckOutRooms,
          hotel_code,
        });
      }

      // update reservation
      await reservationModel.updateRoomBooking(
        {
          status: "checked_out",
        },
        hotel_code,
        booking_id
      );

      // update booking rooms status
      await reservationModel.updateAllBookingRoomsByBookingID(
        { status: "checked_out", checked_out_at: new Date().toISOString() },
        { booking_id }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully Checked out",
      };
    });
  }

  // public async individualRoomCheckOut(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const hotel_code = req.hotel_admin.hotel_code;
  //     const booking_id = parseInt(req.params.id);
  //     const roomID = parseInt(req.params.room_id);

  //     const reservationModel = this.Model.reservationModel(trx);
  //     const sub = new SubReservationService(trx);

  //     const data = await reservationModel.getSingleBooking(
  //       hotel_code,
  //       booking_id
  //     );

  //     if (!data) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: this.ResMsg.HTTP_NOT_FOUND,
  //       };
  //     }

  //     const { status, booking_type, booking_rooms } = data;

  //     if (booking_type != "B" && status != "checked_in") {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "This booking has other status. So, you cannot checkout",
  //       };
  //     }
  //     const singleRoom = await reservationModel.getSingleBookingRoom({
  //       booking_id,
  //       room_id: roomID,
  //     });

  //     if (!singleRoom) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_NOT_FOUND,
  //         message: this.ResMsg.HTTP_NOT_FOUND,
  //       };
  //     }
  //     const { check_out } = singleRoom;

  //     if (check_out > new Date().toISOString()) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: `You can only check out when the check-out date is or after ${check_out}`,
  //       };
  //     }

  //     const checkoutRoom = booking_rooms.find((room) => room.room_id == roomID);

  //     if (!checkoutRoom) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Room not found by this booking ID",
  //       };
  //     }
  //     // room avaibility decrease
  //     await sub.updateRoomAvailabilityService({
  //       reservation_type: "booked_room_decrease",
  //       rooms: [checkoutRoom],
  //       hotel_code,
  //     });

  //     // update booking rooms status
  //     await reservationModel.updateSingleBookingRoom(
  //       { status: "checked_out", checked_out_at: new Date().toISOString() },
  //       { booking_id, room_id: checkoutRoom.room_id }
  //     );

  //     // check all booking rooms are check in or not
  //     const getSingleBookingRoom = await reservationModel.getSingleBooking(
  //       hotel_code,
  //       booking_id
  //     );

  //     if (getSingleBookingRoom) {
  //       const { booking_rooms } = getSingleBookingRoom;

  //       const isAllCheckout = booking_rooms.every(
  //         (room) => room.status === "checked_out"
  //       );

  //       if (isAllCheckout) {
  //         // update main booking
  //         await reservationModel.updateRoomBooking(
  //           { status: "checked_out" },
  //           hotel_code,
  //           booking_id
  //         );
  //       }
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_OK,
  //       message: "Successfully Cheked out",
  //     };
  //   });
  // }

  // v2
  public async individualRoomCheckOut(req: Request) {
    return await this.db.transaction(async (trx) => {
      const hotel_code = req.hotel_admin.hotel_code;
      const booking_id = parseInt(req.params.id);
      const roomID = parseInt(req.params.room_id);

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

      const { status, booking_type, booking_rooms } = data;

      if (booking_type != "B" && status != "checked_in") {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "This booking has other status. So, you cannot checkout",
        };
      }

      const singleRoom = await reservationModel.getSingleBookingRoom({
        booking_id,
        room_id: roomID,
      });

      if (!singleRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      const { check_out } = singleRoom;

      const totalNights = Lib.calculateNights(
        singleRoom.check_in,
        singleRoom.check_out
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(check_out);
      checkOutDate.setHours(0, 0, 0, 0);

      const dayBeforeCheckout = new Date(checkOutDate);
      dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);

      // here below is the logic for if 1 night stay, can checkout on check-out date or previous day by today date
      if (totalNights == 1) {
        if (
          checkOutDate.getTime() !== today.getTime() &&
          dayBeforeCheckout.getTime() !== today.getTime()
        ) {
          console.log("here");
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `You can only check out on or after ${check_out}`,
          };
        }
      }

      if (totalNights > 1) {
        if (new Date(check_out) > new Date()) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `You can only check out on or after ${check_out}`,
          };
        }
      }
      const checkoutRoom = booking_rooms.find((room) => room.room_id == roomID);

      if (!checkoutRoom) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Room not found by this booking ID",
        };
      }
      // room avaibility decrease
      await sub.updateRoomAvailabilityService({
        reservation_type: "booked_room_decrease",
        rooms: [checkoutRoom],
        hotel_code,
      });

      // update booking rooms status
      await reservationModel.updateSingleBookingRoom(
        { status: "checked_out", checked_out_at: new Date().toISOString() },
        { booking_id, room_id: checkoutRoom.room_id }
      );

      // check all booking rooms are check in or not
      const getSingleBookingRoom = await reservationModel.getSingleBooking(
        hotel_code,
        booking_id
      );

      if (getSingleBookingRoom) {
        const { booking_rooms } = getSingleBookingRoom;

        const isAllCheckout = booking_rooms.every(
          (room) => room.status === "checked_out"
        );

        if (isAllCheckout) {
          // update main booking
          await reservationModel.updateRoomBooking(
            { status: "checked_out" },
            hotel_code,
            booking_id
          );
        }
      }

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
            status: "confirmed",
          },
          hotel_code,
          booking_id
        );
        // Availability
        await sub.updateRoomAvailabilityService({
          reservation_type: "hold_decrease",
          rooms: booking_rooms,
          hotel_code,
        });

        await sub.updateRoomAvailabilityService({
          reservation_type: "booked_room_increase",
          rooms: booking_rooms,
          hotel_code,
        });

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
        await sub.updateRoomAvailabilityService({
          reservation_type: "hold_decrease",
          rooms: booking_rooms,
          hotel_code,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Successfully updated",
      };
    });
  }
}
export default ReservationService;
