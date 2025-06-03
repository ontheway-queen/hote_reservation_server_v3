import {
  IBookingDetails,
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

    console.log({ check_in, check_out });

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
                      'booking_id',b.id,
                        'check_in', b.check_in,
                        'check_out', b.check_out,
                        'booking_status', b.status,
                        'guest_id',b.guest_id,
  
                        'guest_name', CONCAT(g.first_name, ' ', g.last_name),
                        'vat',b.vat,
                        'service_charge',b.service_charge,
                        'sub_total',b.sub_total,
                        'discount_amount',b.discount_amount,
                        'total_amount',b.total_amount
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
        "rt.hotel_code",
        this.db.raw(`MIN(ra.available_rooms) AS available_rooms`),
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
      .groupBy("rt.id")
      .having(this.db.raw("MIN(ra.available_rooms) > 0"));
  }

  public async getAllAvailableRoomsByRoomType(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id: number;
  }) {
    const { hotel_code, check_in, check_out, room_type_id } = payload;
    const schema = this.RESERVATION_SCHEMA;

    const availableRoomTypes = () =>
      this.db(`${schema}.room_availability as ra`)
        .joinRaw(
          `
          JOIN (
            SELECT gs1.date AS gen_date
            FROM generate_series(?::date, (?::date - INTERVAL '1 day'), INTERVAL '1 day') AS gs1(date)
          ) d ON d.gen_date = ra.date
        `,
          [check_in, check_out]
        )
        .where("ra.hotel_code", hotel_code)
        .andWhere("ra.room_type_id", room_type_id)
        .andWhere("ra.available_rooms", ">", 0)
        .groupBy("ra.room_type_id")
        .havingRaw(
          `
          COUNT(*) = (
            SELECT COUNT(*) FROM (
              SELECT gs2.date AS gen_date
              FROM generate_series(?::date, (?::date - INTERVAL '1 day'), INTERVAL '1 day') AS gs2(date)
            ) AS dd
          )
        `,
          [check_in, check_out]
        )
        .select("ra.room_type_id");

    return await this.db(`${schema}.rooms as r`)
      .select(
        "r.hotel_code",
        "r.id as room_id",
        "r.room_name",
        "r.room_type_id",
        "rt.name as room_type_name"
      )
      .leftJoin(`${schema}.room_types as rt`, "r.room_type_id", "rt.id")
      .where("r.hotel_code", hotel_code)
      .andWhere("r.room_type_id", room_type_id)
      .whereExists(availableRoomTypes())
      .whereNotExists(function () {
        this.select("*")
          .from(`${schema}.bookings as b`)
          .join(`${schema}.booking_rooms as br`, "br.booking_id", "b.id")
          .whereRaw("br.room_id = r.id")
          .andWhere("b.status", "confirmed")
          .andWhere("b.check_in", "<", check_out)
          .andWhere("b.check_out", ">", check_in);
      });
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

  public async insertBooking(payload: IRoomBooking) {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

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
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "src.name as source_name",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email"
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .orderBy("b.id", "desc");
  }

  public async getSingleBooking(
    hotel_code: number,
    booking_id: number
  ): Promise<IBookingDetails | undefined> {
    return await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "src.name as source_name",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.payment_status",
        "b.comments",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone",
        "g.address",
        "g.country",
        "g.passport_number",
        "g.nationality",
        this.db.raw(
          `(
          SELECT json_agg(
            json_build_object(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant,
              'base_rate', br.base_rate,
              'changed_rate', br.changed_rate
            )
          )
          FROM ?? AS br
          LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
          LEFT JOIN ?? AS r ON br.room_id = r.id
          WHERE br.booking_id = b.id
        ) AS booking_rooms`,
          [
            `${this.RESERVATION_SCHEMA}.booking_rooms`,
            `${this.RESERVATION_SCHEMA}.room_types`,
            `${this.RESERVATION_SCHEMA}.rooms`,
          ]
        )
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.id", booking_id)
      .first();
  }

  public async updateRoomBooking(
    payload: {
      status?: "checked_in" | "checked_out";
      booking_type?: "B" | "C";
    },
    hotel_code: number,
    booking_id: number
  ) {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ hotel_code })
      .andWhere({ id: booking_id });
  }

  public async getLastBooking() {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .limit(1)
      .orderBy("id", "desc");
  }

  public async updateRoomAvailabilityHold({
    hotel_code,
    room_type_id,
    date,
    rooms_to_book,
    type,
  }: {
    hotel_code: number;
    room_type_id: number;
    date: string;
    rooms_to_book: number;
    type: "hold_increase" | "hold_decrease";
  }) {
    if (type == "hold_increase") {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms - ?", [rooms_to_book]),
          hold_rooms: this.db.raw("hold_rooms + ?", [rooms_to_book]),
          updated_at: this.db.fn.now(),
        });
    } else {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms + ?", [rooms_to_book]),
          hold_rooms: this.db.raw("hold_rooms - ?", [rooms_to_book]),
          updated_at: this.db.fn.now(),
        });
    }
  }

  public async updateRoomAvailability({
    type,
    hotel_code,
    room_type_id,
    date,
    rooms_to_book,
  }: {
    type: "booked_room_increase" | "booked_room_decrease";
    hotel_code: number;
    room_type_id: number;
    date: string;
    rooms_to_book: number;
  }) {
    if (type === "booked_room_increase") {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms - ?", [rooms_to_book]),
          booked_rooms: this.db.raw("booked_rooms + ?", [rooms_to_book]),
          updated_at: this.db.fn.now(),
        });
    } else {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms + ?", [rooms_to_book]),
          booked_rooms: this.db.raw("booked_rooms - ?", [rooms_to_book]),
          updated_at: this.db.fn.now(),
        });
    }
  }

  public async getFoliosbySingleBooking(
    hotel_code: number,
    booking_id: number
  ): Promise<{ id: number; name: string }[]> {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name")
      .where("booking_id", booking_id)
      .andWhere("hotel_code", hotel_code);
  }

  public async getFoliosWithEntriesbySingleBooking({
    hotel_code,
    booking_id,
    entry_ids,
  }: {
    hotel_code: number;
    booking_id: number;
    entry_ids?: number[];
  }): Promise<{ id: number; name: string }[]> {
    return await this.db("folios as f")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "f.id",
        "f.name",
        this.db.raw(
          `(SELECT JSON_AGG(JSON_BUILD_OBJECT('entries_id',fe.id,'description',fe.description,'posting_type',fe.posting_type,'debit',fe.debit,'credit',fe.credit,'created_at',fe.created_at,'is_void',fe.is_void,'invoiced',fe.invoiced)) as folio_entries)`
        )
      )
      .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
      .where("booking_id", booking_id)
      .andWhere("hotel_code", hotel_code)
      .andWhere(function () {
        if (entry_ids?.length) {
          this.whereIn("fe.id", entry_ids);
        }
      })
      .groupBy("f.id", "f.name");
  }

  public async getSingleFoliobyHotelCodeAndID(
    hotel_code: number,
    folio_id: number
  ): Promise<
    | {
        id: number;
        name: string;
        guest_id: number;
        booking_id: string;
      }
    | undefined
  > {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name", "guest_id", "booking_id")
      .where("id", folio_id)
      .andWhere("hotel_code", hotel_code)
      .first();
  }

  public async getFolioEntriesbyFolioID(hotel_code: number, folio_id: number) {
    return await this.db("folio_entries as fe")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "fe.id",
        "fe.description",
        "fe.posting_type",
        "fe.debit",
        "fe.credit"
      )
      .join("folios as f", "fe.folio_id", "f.id")
      .where("fe.folio_id", folio_id)
      .andWhere("f.hotel_code", hotel_code);
  }

  public async getFoliosEntriesbySingleBooking({
    hotel_code,
    booking_id,
    entry_ids,
  }: {
    hotel_code: number;
    booking_id: number;
    entry_ids?: number[];
  }): Promise<{ id: number; name: string }[]> {
    return await this.db("folios as f")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "f.id",
        "f.name",
        "fe.id as entries_id",
        "fe.description",
        "fe.posting_type",
        "fe.debit",
        "fe.credi",
        "fe.is_void",
        "fe.invoiced"
      )
      .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
      .where("booking_id", booking_id)
      .andWhere("hotel_code", hotel_code)
      .andWhere(function () {
        if (entry_ids?.length) {
          this.whereIn("fe.id", entry_ids);
        }
      });
  }

  public async getFolioEntriesCalculation(folioEntryIds: number[]): Promise<{
    total_amount: number;
    paid_amount: number;
    due_amount: number;
  }> {
    return await this.db("folio_entries")
      .whereIn("id", folioEntryIds)
      .select(
        this.db.raw(`
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) AS total_amount,
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS paid_amount,
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) -
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS due_amount
    `)
      )
      .first();
  }
}
