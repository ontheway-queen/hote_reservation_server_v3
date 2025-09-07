import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";
import {
  hotelSearchAvailabilityReqPayload,
  IBookedRoomTypeRequest,
  IBookingRequestBody,
  IBRoomGuest,
  recheckReqPayload,
} from "../utills/interfaces/btoc.hotel.interface";
import { SubBtocHotelService } from "./btoc.subHotel.service";

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

  public async recheck(req: Request) {
    const { hotel_code } = req.web_token;

    const { checkin, checkout, rooms, room_type_id, rate_plan_id } =
      req.body as recheckReqPayload;

    const nights = HelperFunction.calculateNights(checkin, checkout);
    const getAvailableRoom =
      await this.BtocModels.btocReservationModel().recheck({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
        rate_plan_id,
        room_type_id,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data: {
        no_of_nights: nights,
        checkin,
        checkout,
        no_of_rooms: rooms.length,
        data: getAvailableRoom,
      },
    };
  }

  public async booking(req: Request) {
    return this.db.transaction(async (trx) => {
      const { hotel_code } = req.web_token;
      const {
        checkin,
        checkout,
        room_type_id,
        rate_plan_id,
        rooms,
        special_requests,
        holder,
      } = req.body as IBookingRequestBody;

      const nights = HelperFunction.calculateNights(checkin, checkout);
      const recheck = await this.BtocModels.btocReservationModel().recheck({
        hotel_code,
        nights,
        checkin: checkin as string,
        checkout: checkout as string,
        rooms,
        rate_plan_id,
        room_type_id,
      });

      if (!recheck) {
        throw new Error("Room not available for booking");
      }

      const sub = new SubBtocHotelService(trx);
      // Insert or get lead guest
      const guest_id = await sub.findOrCreateGuest(holder, hotel_code);

      // Create main booking
      const booking = await sub.createMainBooking({
        payload: {
          is_individual_booking: true,
          check_in: checkin,
          check_out: checkout,
          created_by: req.btoc_user.id,
          booking_type: "B",
          special_requests,
          payment_status: "unpaid",
        },
        hotel_code,
        guest_id,
        total_nights: nights,
        total_amount: recheck.price,
        sub_total: recheck.price,
      });

      const booked_room_types: IBookedRoomTypeRequest[] = [];

      rooms.forEach((room) => {
        const guestRoom: IBRoomGuest = {
          check_in: checkin,
          check_out: checkout,
          adults: room.adults,
          children: room.children_ages.length,
          rate: {
            base_rate: recheck.rate.base_rate,
            changed_rate: recheck.rate.base_rate,
          },
          guest_info: room?.paxes?.map((pax) => ({
            title: pax.title,
            first_name: pax.name,
            last_name: pax.surname,
            is_room_primary_guest: false,
            type:
              pax.type === "AD"
                ? "adult"
                : pax.type === "CH"
                ? "child"
                : "infant",
          })),
        };

        booked_room_types.push({
          room_type_id,
          rate_plan_id,
          rooms: [guestRoom],
        });
      });

      // Insert booking rooms
      await sub.insertBookingRooms({
        booked_room_types,
        booking_id: booking.id,
        hotel_code,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        booking_ref: booking.booking_ref,
      };
    });
  }

  public async getAllBooking(req: Request) {
    const { hotel_code } = req.web_token;
    const { search, limit, skip, booking_type, status } = req.query;

    const { data, total } =
      await this.BtocModels.btocReservationModel().getAllBooking({
        hotel_code,
        search: search as string,
        user_id: req.btoc_user.id,
        limit: limit as string,
        skip: skip as string,
        booking_type: booking_type as string,
        status: status as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleBooking(req: Request) {
    const { hotel_code } = req.web_token;
    const { ref_id } = req.params;

    const data = await this.BtocModels.btocReservationModel().getSingleBooking({
      hotel_code,
      user_id: req.btoc_user.id,
      ref_id: ref_id as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async cancelSingleBooking(req: Request) {
    const { hotel_code } = req.web_token;
    const { ref_id } = req.params;

    const data = await this.BtocModels.btocReservationModel().getSingleBooking({
      hotel_code,
      user_id: req.btoc_user.id,
      ref_id: ref_id as string,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Booking not found",
      };
    }

    console.log({ data });
    if (
      data.status == "pending" &&
      data.booking_type === "B" &&
      (data.payment_status === "unpaid" || !data.payment_status)
    ) {
      await this.BtocModels.btocReservationModel().cancelSingleBooking({
        hotel_code,
        user_id: req.btoc_user.id,
        ref_id: ref_id as string,
      });
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message:
          "Booking cannot be canceled, Only pending bookings can be canceled",
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
    };
  }
}
