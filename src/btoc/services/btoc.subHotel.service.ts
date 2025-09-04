import { title } from "process";
import { BtocReservationModel } from "../../models/reservationPanel/BtocModel/btoc.reservation.model";
import { Knex } from "knex";
import AbstractServices from "../../abstarcts/abstract.service";
import { HelperFunction } from "../../appAdmin/utlis/library/helperFunction";
import Lib from "../../utils/lib/lib";
import {
  IBookedRoomTypeRequest,
  IHolder,
} from "../utills/interfaces/btoc.hotel.interface";

export class SubBtocHotelService extends AbstractServices {
  constructor(private trx: Knex.Transaction) {
    super();
  }

  public calculateNights(checkIn: string, checkOut: string): number {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public addDays(date: string | Date, days = 0): string {
    const base =
      typeof date === "string" ? new Date(`${date}T00:00:00Z`) : new Date(date);
    base.setUTCHours(0, 0, 0, 0);

    base.setUTCDate(base.getUTCDate() + days);

    return base.toISOString().slice(0, 10);
  }

  public async findOrCreateGuest(
    guest: IHolder,
    hotel_code: number
  ): Promise<number> {
    const guestModel = this.Model.guestModel(this.trx);
    // Check if guest already exists
    const existingGuest = await guestModel.getSingleGuest({
      email: guest.email,
      hotel_code,
    });
    console.log({ existingGuest });
    if (existingGuest.length) {
      return existingGuest[0].id;
    }
    const [insertedGuest] = await guestModel.createGuest({
      hotel_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      //   country_id: guest.country_id,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      //   passport_no: guest.passport_no,
    });

    return insertedGuest.id;
  }
  async createMainBooking({
    payload,
    hotel_code,
    guest_id,
    sub_total,
    total_amount,
    total_nights,
  }: {
    payload: {
      check_in: string;
      check_out: string;
      booking_type: string;
      created_by: number;
      special_requests?: string;
      is_individual_booking: boolean;
      payment_status: "paid" | "unpaid";
    };
    hotel_code: number;
    guest_id: number;
    sub_total: number;
    total_amount: number;
    total_nights: number;
  }): Promise<{ id: number; booking_ref: string }> {
    const reservation_model = this.BtocModels.btocReservationModel(this.trx);
    const last = await reservation_model.getLastBooking();
    const lastId = last?.id ?? 1;

    const ref = Lib.generateBookingReferenceWithId(`WB`, lastId);

    const [booking] = await reservation_model.insertBooking({
      booking_date: new Date().toLocaleDateString(),
      booking_reference: ref,
      check_in: payload.check_in,
      check_out: payload.check_out,
      guest_id,
      hotel_code,
      sub_total,
      is_individual_booking: payload.is_individual_booking,
      total_amount,
      total_nights,
      payment_status: payload.payment_status,
      comments: payload.special_requests,
      booking_type: payload.booking_type,
      created_by: payload.created_by,
      status: "pending",
      book_from: "web",
    });

    return { id: booking.id, booking_ref: ref };
  }

  public async insertBookingRooms({
    booked_room_types,
    booking_id,
    hotel_code,
  }: {
    booked_room_types: IBookedRoomTypeRequest[];
    booking_id: number;
    hotel_code: number;
  }) {
    for (const rt of booked_room_types) {
      for (const room of rt.rooms) {
        const nights = HelperFunction.calculateNights(
          room.check_in,
          room.check_out
        );

        // Insert booking room
        const [bookingRoomRes] = await this.BtocModels.btocReservationModel(
          this.trx
        ).insertBookingRoom([
          {
            check_in: room.check_in,
            check_out: room.check_out,
            status: "pending",
            booking_id,
            room_type_id: rt.room_type_id,
            adults: room.adults,
            children: room.children,

            base_rate: room.rate.base_rate * nights,
            changed_rate: room.rate.changed_rate * nights,
            unit_base_rate: room.rate.base_rate,
            unit_changed_rate: room.rate.changed_rate,
          },
        ]);

        const booking_room_id = bookingRoomRes.id;

        // Insert guests and booking_room_guests
        if (room?.guest_info) {
          console.log(room.guest_info);

          for (const guest of room.guest_info) {
            const [guestRes] = await this.Model.guestModel(
              this.trx
            ).createGuestForGroupBooking({
              title: guest.title,
              first_name: guest.first_name,
              last_name: guest.last_name,
              email: guest.email,
              address: guest.address,
              country_id: guest.country_id,
              phone: guest.phone,
              passport_no: guest.passport_no,
              hotel_code,
            });

            await this.Model.reservationModel(this.trx).insertBookingRoomGuest({
              // is_lead_guest: guest.is_lead_guest,
              guest_id: guestRes.id,
              hotel_code,
              booking_room_id,
              is_room_primary_guest: guest.is_room_primary_guest,
            });
          }
        }
      }
    }
  }
}
