import {
  IbookingRooms,
  IgetAccommodationSettings,
  IgetChildRateGroups,
  IRoomBooking,
  ISearchAvailableRoom,
} from "../../appAdmin/utlis/interfaces/reservation.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export class ReservationModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async calendar(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
  }) {
    const { hotel_code, check_in, check_out } = payload;
    const db = this.db;

    return await db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rt.id",
        "rt.name",
        "rt.hotel_code",
        db.raw(
          `
          COALESCE(
            json_agg(
              jsonb_build_object(
                'room_id', r.id,
                'room_name', r.room_name,
                'room_status',r.status,
                'bookings', COALESCE(
                  (
                    SELECT json_agg(
                      jsonb_build_object(
                        'check_in', b.check_in,
                        'check_out', b.check_out,
                        'booking_status', b.status,
                        'guest_name', CONCAT(g.first_name, ' ', g.last_name)
                      )
                    )
                    FROM ?? AS br2
                    JOIN ?? AS b ON br2.booking_id = b.id
                    JOIN ?? AS g ON b.guest_id = g.id
                    WHERE br2.room_id = r.id
                      AND b.check_in <= ?
                      AND b.check_out >= ?
                      AND b.status != ?
                  ), '[]'
                )
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS rooms
          `,
          [
            `${this.RESERVATION_SCHEMA}.booking_rooms`,
            `${this.RESERVATION_SCHEMA}.bookings`,
            `${this.RESERVATION_SCHEMA}.guests`,
            check_out,
            check_in,
            "checkout",
          ]
        )
      )
      .leftJoin("rooms as r", "rt.id", "r.room_type_id")
      .where("rt.hotel_code", hotel_code)
      .groupBy("rt.id");
  }

  // get all available rooms with types by checkn and check out dates
  public async getAllAvailableRoomsTypeWithAvailableRoomCount(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
  }) {
    const { hotel_code, check_in, check_out } = payload;

    return await this.db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rt.id",
        "rt.name",
        "rt.description",
        "rt.base_price",
        "rt.hotel_code",
        this.db.raw(`COALESCE(MIN(ra.available_rooms), 0) AS available_rooms`),
        this.db.raw(`
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'rate_plan_id', rpd.id,
              'name', rp.name,
              'base_rate', rpd.base_rate
            )
          ) FILTER (WHERE rpd.id IS NOT NULL),
          '[]'
        ) AS rate_plans
      `)
      )
      .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
      .leftJoin("rate_plan_details as rpd", "rt.id", "rpd.room_type_id")
      .leftJoin("rate_plans as rp", "rpd.rate_plan_id", "rp.id")
      .where("rt.hotel_code", hotel_code)
      .andWhere("ra.date", ">=", check_in)
      .andWhere("ra.date", "<", check_out)
      .groupBy("rt.id");
  }

  public async getAllAvailableRoomsTypeForEachAvailableRoom(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
  }) {
    const { hotel_code, check_in, check_out } = payload;

    console.log({ check_in, check_out });

    const db = this.db;
    return await db("room_availability as ra")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "ra.room_type_id",
        "ra.hotel_code",
        "ra.available_rooms",
        db.raw("ra.date::text as date")
      )
      .where("ra.hotel_code", hotel_code)
      .andWhere("ra.date", ">=", "2025-06-01")
      .andWhere("ra.date", "<=", "2025-06-04")
      .orderBy("ra.date", "asc");
  }

  public async getAllAvailableRoomsByRoomType(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id: number;
  }) {
    const { hotel_code, check_in, check_out, room_type_id } = payload;

    console.log({ payload });

    const schema = this.RESERVATION_SCHEMA;

    return await this.db("rooms as r")
      .withSchema(schema)
      .select(
        "r.hotel_code",
        "r.id as room_id",
        "r.room_name",
        "r.room_type_id",
        "rt.name as room_type_name"
      )
      .leftJoin("room_types as rt", "r.room_type_id", "rt.id")
      .where("r.hotel_code", hotel_code)
      .andWhere("r.room_type_id", room_type_id)
      .whereNotExists(function () {
        this.select("*")
          .from("bookings as b")
          .withSchema(schema)
          .join("booking_rooms as br", "br.booking_id", "b.id")
          .whereRaw("br.room_id = r.id")
          .andWhere("b.status", "confirmed")
          .andWhere("b.check_in", "<", check_out)
          .andWhere("b.check_out", ">", check_in);
      });
  }

  public async insertRoomBooking(payload: IRoomBooking) {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // insert booking rooms
  public async insertBookingRoom(payload: IbookingRooms[]) {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getAllBooking({ hotel_code }: { hotel_code: number }) {
    return await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.booking_reference",
        "b.booking_date",
        "b.check_in",
        "b.check_out",
        "b.status",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge"
      )
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .orderBy("b.id", "desc");
  }

  public async getLastBooking() {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .limit(1)
      .orderBy("id", "desc");
  }

  public async updateRoomAvailability({
    hotel_code,
    room_type_id,
    date,
    rooms_to_book,
  }: {
    hotel_code: number;
    room_type_id: number;
    date: string;
    rooms_to_book: number;
  }) {
    return await this.db("room_availability")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ hotel_code, room_type_id, date })
      .update({
        available_rooms: this.db.raw("available_rooms - ?", [rooms_to_book]),
        booked_rooms: this.db.raw("booked_rooms + ?", [rooms_to_book]),
        updated_at: this.db.fn.now(),
      });
  }
}
