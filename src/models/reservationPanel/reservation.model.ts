import { number } from "joi";
import {
  CalendarRoomType,
  IAvailableRoomType,
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

  //   public async calendar(payload: {
  //     check_in: string;
  //     check_out: string;
  //     hotel_code: number;
  //   }): Promise<CalendarRoomType[]> {
  //     const { hotel_code, check_in, check_out } = payload;
  //     const db = this.db;

  //     return await db("room_types as rt")
  //       .withSchema(this.RESERVATION_SCHEMA)
  //       .select(
  //         "rt.id",
  //         "rt.name",
  //         "rt.hotel_code",
  //         db.raw(
  //           `
  //           COALESCE(
  //             json_agg(
  //               jsonb_build_object(
  //                 'room_id', r.id,
  //                 'room_name', r.room_name,
  //                 'room_status',r.status,
  //                 'bookings', COALESCE(
  //                   (
  //                     SELECT json_agg(
  //                       jsonb_build_object(
  //                       'booking_id',b.id,
  //                         'check_in', br2.check_in,
  //                         'check_out', br2.check_out,
  //                         'booking_status', br2.status,
  //                         'guest_id',b.guest_id,
  //                         'guest_name', CONCAT(g.first_name, ' ', g.last_name),
  //                         'vat',b.vat,
  //                         'service_charge',b.service_charge,
  //                         'discount_amount',b.discount_amount,
  //                         'total_amount',b.total_amount
  //                       )
  //                     )
  //                     FROM ?? AS br2
  //                     JOIN ?? AS b ON br2.booking_id = b.id
  //                     JOIN ?? AS g ON b.guest_id = g.id
  // WHERE br2.room_id = r.id
  // AND (
  //   (b.booking_type = 'B' AND b.status NOT IN ('checked_out', 'pending', 'canceled', 'rejected'))
  //   OR
  //   (b.booking_type = 'H' AND b.status != 'canceled')
  // )
  //                       AND br2.check_in < ?
  //                       AND br2.check_out > ?
  //                       AND br2.status != ?
  //                   ), '[]'
  //                 )
  //               )
  //                 order by r.room_name::int asc
  //             ) FILTER (WHERE r.id IS NOT NULL),
  //             '[]'
  //           ) AS rooms
  //           `,
  //           [
  //             `${this.RESERVATION_SCHEMA}.booking_rooms`,
  //             `${this.RESERVATION_SCHEMA}.bookings`,
  //             `${this.RESERVATION_SCHEMA}.guests`,
  //             check_out,
  //             check_in,
  //             "checkout",
  //           ]
  //         )
  //       )
  //       .leftJoin("rooms as r", "rt.id", "r.room_type_id")
  //       .where("rt.hotel_code", hotel_code)
  //       .groupBy("rt.id")
  //       .orderBy("rt.name", "asc");
  //   }

  public async calendar(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
  }): Promise<CalendarRoomType[]> {
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
              'room_status', r.status,
              'bookings', COALESCE(
                (
                  SELECT json_agg(
                    jsonb_build_object(
                      'booking_id', b.id,
                      'check_in', br2.check_in,
                      'check_out', br2.check_out,
                      'stay_nights', (
                        SELECT json_agg(to_char(d, 'YYYY-MM-DD'))
                        FROM generate_series(
                          br2.check_in,
                          br2.check_out - INTERVAL '1 day',
                          INTERVAL '1 day'
                        ) AS d
                      ),
                      'booking_status', br2.status,
                      'guest_id', b.guest_id,
                      'guest_name', CONCAT(g.first_name, ' ', g.last_name),
                      'vat', b.vat,
                      'service_charge', b.service_charge,
                      'discount_amount', b.discount_amount,
                      'total_amount', b.total_amount
                    )
                  )
                  FROM ?? AS br2
                  JOIN ?? AS b ON br2.booking_id = b.id
                  JOIN ?? AS g ON b.guest_id = g.id
                  WHERE br2.room_id = r.id
                    AND (
                      (b.booking_type = 'B' AND b.status NOT IN ('checked_out', 'pending', 'canceled', 'rejected'))
                      OR
                      (b.booking_type = 'H' AND b.status != 'canceled')
                    )
                    AND br2.check_in < ?
                    AND br2.check_out > ?
                    AND br2.status != ?
                ), '[]'
              )
            )
            ORDER BY r.room_name::int ASC
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS rooms
        `,
          [
            `${this.RESERVATION_SCHEMA}.booking_rooms`,
            `${this.RESERVATION_SCHEMA}.bookings`,
            `${this.RESERVATION_SCHEMA}.guests`,
            check_out, // br2.check_in < check_out
            check_in, // br2.check_out > check_in
            "checkout",
          ]
        )
      )
      .leftJoin("rooms as r", "rt.id", "r.room_type_id")
      .where("rt.hotel_code", hotel_code)
      .groupBy("rt.id")
      .orderBy("rt.name", "asc");
  }

  public async getAllAvailableRoomsTypeWithAvailableRoomCount(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id?: number;
    exclude_booking_id?: number;
  }): Promise<IAvailableRoomType[]> {
    const { hotel_code, check_in, check_out, room_type_id } = payload;

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
            'rate_plan_id', rp.id,
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
      .andWhere("rt.is_deleted", false)
      .andWhere("ra.date", ">=", check_in)
      .andWhere("ra.date", "<", check_out)
      .andWhere(function () {
        if (room_type_id) {
          this.andWhere("rt.id", room_type_id);
        }
      })

      .groupBy("rt.id", "rt.name", "rt.description", "rt.hotel_code")
      .having(this.db.raw("MIN(ra.available_rooms) > 0"));
  }

  public async getAllAvailableRoomsByRoomType(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id: number;
    exclude_booking_id?: number;
  }): Promise<
    {
      hotel_code: number;
      room_id: number;
      room_name: string;
      room_type_id: number;
      room_type_name: string;
    }[]
  > {
    const {
      hotel_code,
      check_in,
      check_out,
      room_type_id,
      exclude_booking_id,
    } = payload;

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
      .andWhere("r.is_deleted", false)
      .andWhere("r.room_type_id", room_type_id)
      .whereExists(availableRoomTypes())
      .whereNotExists(function () {
        this.select("*")
          .from(`${schema}.bookings as b`)
          .join(`${schema}.booking_rooms as br`, "br.booking_id", "b.id")
          .whereRaw("br.room_id = r.id")
          .andWhere(function () {
            if (exclude_booking_id) {
              this.andWhere("br.booking_id", "!=", exclude_booking_id);
            }
          })
          .andWhere(function () {
            this.where(function () {
              this.where("b.booking_type", "B").whereNotIn("br.status", [
                "checked_out",
                "pending",
                "canceled",
                "rejected",
              ]);
            }).orWhere(function () {
              this.where("b.booking_type", "H").where(
                "br.status",
                "!=",
                "canceled"
              );
            });
          })
          .andWhere("br.check_in", "<", check_out)
          .andWhere("br.check_out", ">", check_in);
      });
  }

  public async getAvailableRoomsByRoomType(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id: number;
    exclude_booking_id?: number;
  }): Promise<
    {
      hotel_code: number;
      room_id: number;
      room_name: string;
      room_type_id: number;
      room_type_name: string;
    }[]
  > {
    const {
      hotel_code,
      check_in,
      check_out,
      room_type_id,
      exclude_booking_id,
    } = payload;

    const schema = this.RESERVATION_SCHEMA;

    const availableRooms = await this.db
      .withSchema(schema)
      .select(
        "r.id as room_id",
        "r.room_name",
        "r.room_type_id",
        "r.hotel_code"
      )
      .from("rooms as r")
      .leftJoin("room_types as rt", "r.room_type_id", "rt.id")
      .where("r.hotel_code", hotel_code)
      .andWhere("r.room_type_id", room_type_id)
      .andWhere("r.is_deleted", false)
      .whereNotExists(function () {
        this.select("*")
          .from(`${schema}.bookings as b`)
          .join(`${schema}.booking_rooms as br`, "br.booking_id", "b.id")
          .whereRaw("br.room_id = r.id")
          .andWhere("br.check_in", "<", check_out)
          .andWhere("br.check_out", ">", check_in)
          .modify((qb) => {
            if (exclude_booking_id) {
              qb.andWhere("br.booking_id", "!=", exclude_booking_id);
            }
          })
          .andWhere(function () {
            this.where(function () {
              this.where("b.booking_type", "B").whereNotIn("br.status", [
                "checked_out",
                "pending",
                "canceled",
                "rejected",
              ]);
            }).orWhere(function () {
              this.where("b.booking_type", "H").where(
                "br.status",
                "!=",
                "canceled"
              );
            });
          });
      });

    return availableRooms;
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
      .andWhere("ra.date", ">=", check_in)
      .andWhere("ra.date", "<=", check_out)
      .orderBy("ra.date", "asc");
  }

  public async insertBooking(payload: IRoomBooking) {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllBookingRoomsByBookingId({
    booking_id,
    hotel_code,
  }: {
    booking_id: number;
    hotel_code?: number;
  }): Promise<
    {
      id: number;
      room_id: number;
      unit_base_rate: number;
      unit_changed_rate: number;
      base_rate: number;
      changed_rate: number;
      check_in: string;
      check_out: string;
    }[]
  > {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "id",
        "room_id",
        "unit_base_rate",
        "unit_changed_rate",
        "base_rate",
        "changed_rate",
        this.db.raw(`TO_CHAR(check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(check_out, 'YYYY-MM-DD') as check_out`)
      )
      .where({
        booking_id,
      });
  }

  public async insertBookingRoom(payload: IbookingRooms[]) {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getSingleBookingRoom({
    booking_id,
    room_id,
  }: {
    booking_id: number;
    room_id: number;
  }): Promise<{
    id: number;
    room_id: number;
    unit_base_rate: number;
    unit_changed_rate: number;
    base_rate: number;
    changed_rate: number;
    check_in: string;
    check_out: string;
    room_type_id: number;
  }> {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "id",
        "room_id",
        "unit_base_rate",
        "unit_changed_rate",
        "base_rate",
        "changed_rate",
        this.db.raw(`TO_CHAR(check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(check_out, 'YYYY-MM-DD') as check_out`),
        "room_type_id"
      )
      .where({
        booking_id,
        room_id,
      })
      .first();
  }

  public async updateSingleBookingRoom(
    payload: {
      room_id?: number;
      room_type_id?: number;
      unit_changed_rate?: number;
      unit_base_rate?: number;
      base_rate?: number;
      changed_rate?: number;
      status?: "checked_in" | "checked_out" | "confirmed";
      checked_out_at?: string;
      checked_in_at?: string;

      check_in?: string;
      check_out?: string;
      nights?: number;
    },
    where: {
      room_id: number;
      booking_id: number;
    }
  ) {
    console.log({ payload });
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("room_id", where.room_id)
      .andWhere("booking_id", where.booking_id);
  }

  public async updateAllBookingRoomsByBookingID(
    payload: {
      unit_changed_rate?: number;
      unit_base_rate?: number;
      base_rate?: number;
      changed_rate?: number;
      status?: "checked_in" | "checked_out" | "confirmed";
      checked_out_at?: string;
      checked_in_at?: string;
    },
    where: {
      booking_id: number;
      exclude_checkout?: boolean;
    }
  ) {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("booking_id", where.booking_id)
      .andWhere(function () {
        if (where.exclude_checkout) {
          this.andWhereNot("status", "checked_out");
        }
      });
  }

  public async insertBookingRoomGuest(payload: {
    hotel_code: number;
    // is_lead_guest: boolean;
    is_room_primary_guest: boolean;
    booking_room_id: number;
    guest_id: number;
  }) {
    return await this.db("booking_room_guest")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async deleteBookingRoomGuest({
    booking_room_id,
    guest_ids,
    booking_room_ids,
  }: {
    booking_room_id?: number;
    booking_room_ids?: number[];
    guest_ids?: number[];
  }) {
    return await this.db("booking_room_guest")
      .withSchema(this.RESERVATION_SCHEMA)
      .del()
      .where(function () {
        if (booking_room_id) {
          this.where({ booking_room_id });
        }
        if (booking_room_ids?.length) {
          this.whereIn("booking_room_id", booking_room_ids);
        }
        if (guest_ids?.length) {
          this.whereIn("guest_id", guest_ids);
        }
      });
  }

  public async getAllBooking({
    hotel_code,
    checkin_from,
    checkin_to,
    checkout_from,
    checkout_to,
    booked_from,
    booked_to,
    limit,
    search,
    skip,
    booking_type,
    status,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
    checkin_from?: string;
    checkin_to?: string;
    checkout_from?: string;
    checkout_to?: string;
    booked_from?: string;
    booked_to?: string;
    search?: string;
    status?: string;
    booking_type?: string;
  }) {
    const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
    // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);

    const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
    // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);

    const endBookedDate = booked_to ? new Date(booked_to) : null;
    // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);

    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = skip ? Number(skip) : 0;

    const data = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "b.is_individual_booking",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.source_id",
        "src.name as source_name",
        "b.company_name",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "b.visit_purpose",
        "b.comments",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone as guest_phone",
        this.db.raw(
          `(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`,
          [
            "hotel_reservation.booking_rooms",
            "hotel_reservation.room_types",
            "hotel_reservation.rooms",
          ]
        )
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }
        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }
        if (search) {
          this.andWhere(function () {
            this.where("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          });
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      })
      .orderBy("b.id", "desc")
      .limit(limitNum)
      .offset(offsetNum);

    const total = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("b.id as total")
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }

        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }

        if (search) {
          this.andWhere("b.booking_reference", "ilike", `%${search}%`)
            .orWhere("g.first_name", "ilike", `%${search}%`)
            .orWhere("g.email", "ilike", `%${search}%`);
        }

        if (status) {
          this.andWhere("b.status", status);
        }

        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }

  public async getAllIndividualBooking({
    hotel_code,
    checkin_from,
    checkin_to,
    checkout_from,
    checkout_to,
    booked_from,
    booked_to,
    limit,
    search,
    skip,
    booking_type,
    status,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
    checkin_from?: string;
    checkin_to?: string;
    checkout_from?: string;
    checkout_to?: string;
    booked_from?: string;
    booked_to?: string;
    search?: string;
    status?: string;
    booking_type?: string;
  }) {
    const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
    // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);

    const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
    // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);

    const endBookedDate = booked_to ? new Date(booked_to) : null;
    // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);

    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = skip ? Number(skip) : 0;

    const data = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "b.is_individual_booking",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.source_id",
        "src.name as source_name",
        "b.company_name",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "b.visit_purpose",
        "b.comments",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone as guest_phone",
        this.db.raw(
          `(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`,
          [
            "hotel_reservation.booking_rooms",
            "hotel_reservation.room_types",
            "hotel_reservation.rooms",
          ]
        )
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.is_individual_booking", true)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }
        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }
        if (search) {
          this.andWhere(function () {
            this.where("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          });
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      })
      .orderBy("b.id", "desc")
      .limit(limitNum)
      .offset(offsetNum);

    const total = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("b.id as total")
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.is_individual_booking", true)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }

        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }

        if (search) {
          this.andWhere("b.booking_reference", "ilike", `%${search}%`)
            .orWhere("g.first_name", "ilike", `%${search}%`)
            .orWhere("g.email", "ilike", `%${search}%`);
        }

        if (status) {
          this.andWhere("b.status", status);
        }

        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }

  public async getAllGroupBooking({
    hotel_code,
    checkin_from,
    checkin_to,
    checkout_from,
    checkout_to,
    booked_from,
    booked_to,
    limit,
    search,
    skip,
    booking_type,
    status,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
    checkin_from?: string;
    checkin_to?: string;
    checkout_from?: string;
    checkout_to?: string;
    booked_from?: string;
    booked_to?: string;
    search?: string;
    status?: string;
    booking_type?: string;
  }) {
    const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
    // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);

    const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
    // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);

    const endBookedDate = booked_to ? new Date(booked_to) : null;
    // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);

    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = skip ? Number(skip) : 0;

    const data = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "b.is_individual_booking",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.source_id",
        "src.name as source_name",
        "b.company_name",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "b.visit_purpose",
        "b.comments",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone as guest_phone",
        this.db.raw(
          `(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`,
          [
            "hotel_reservation.booking_rooms",
            "hotel_reservation.room_types",
            "hotel_reservation.rooms",
          ]
        )
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.is_individual_booking", false)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }
        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }
        if (search) {
          this.andWhere(function () {
            this.where("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          });
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      })
      .orderBy("b.id", "desc")
      .limit(limitNum)
      .offset(offsetNum);

    const total = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("b.id as total")
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.is_individual_booking", false)
      .andWhere(function () {
        if (checkin_from && checkin_to) {
          this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
        }
        if (checkout_from && checkout_to) {
          this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
        }

        if (booked_from && booked_to) {
          this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
        }

        if (search) {
          this.andWhere("b.booking_reference", "ilike", `%${search}%`)
            .orWhere("g.first_name", "ilike", `%${search}%`)
            .orWhere("g.email", "ilike", `%${search}%`);
        }

        if (status) {
          this.andWhere("b.status", status);
        }

        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
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
        "b.is_individual_booking",
        "b.voucher_no",
        "b.source_id",
        "src.name as source_name",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.service_charge_percentage",
        "b.vat_percentage",
        "b.payment_status",
        "b.comments",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "b.visit_purpose",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone",
        "g.address",
        "c.country_name",
        "g.passport_no",
        "c.nationality",
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
                'cbf',br.cbf,
                'base_rate', br.base_rate,
                'changed_rate', br.changed_rate,
                'unit_base_rate', br.unit_base_rate,
                'unit_changed_rate', br.unit_changed_rate,
             'check_in',  br.check_in::date,
             'check_out', br.check_out::date,
                'status',br.status,
                'room_guests', (
                  SELECT COALESCE(
                    json_agg(
                      json_build_object(
                        'guest_id', gg.id,
                        'first_name', gg.first_name,
                        'last_name', gg.last_name,
                        'email', gg.email,
                        'phone', gg.phone,
                        'address', gg.address,
                        'country', c.country_name,
                        'nationality', c.nationality,
                        'is_room_primary_guest', brg.is_room_primary_guest
                      )
                    ),
                    '[]'::json
                  )
                  FROM hotel_reservation.booking_room_guest AS brg
                  JOIN hotel_reservation.guests AS gg ON brg.guest_id = gg.id
                  LEFT JOIN public.country AS c ON gg.country_id = c.id
                  WHERE brg.booking_room_id = br.id
                )
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
      .joinRaw("left join public.country c on g.country_id = c.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.id", booking_id)
      .first();
  }

  public async updateRoomBooking(
    payload: Partial<{
      status: "checked_in" | "checked_out" | "confirmed" | "canceled";
      booking_type: "B" | "C" | "H";
      total_amount: number;
      sub_total: number;
      total_nights: number;
      check_in: string;
      check_out: string;
      comments: string;
      pickup: boolean;
      pickup_from: string;
      pickup_time: string;
      voucher_no?: string;
      drop: boolean;
      drop_to: string;
      drop_time: string;
      visit_purpose: string;
      source_id: number;
      company_name: string;
    }>,
    hotel_code: number,
    booking_id: number
  ) {
    return await this.db("bookings")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ hotel_code })
      .andWhere({ id: booking_id });
  }

  public async deleteBookingRooms(room_ids: number[], booking_id: number) {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .del()
      .whereIn("room_id", room_ids)
      .andWhere("booking_id", booking_id);
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

  public async getArrivalDepStayBookings({
    current_date,
    hotel_code,
    booking_mode,
    limit,
    skip,
    search,
  }: {
    hotel_code: number;
    current_date: string;
    limit?: string;
    skip?: string;
    search: string;
    booking_mode: "arrival" | "departure" | "stay";
  }) {
    if (booking_mode == "arrival") {
      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .count("b.id as total")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("b.check_in", current_date)
        .andWhere("b.status", "confirmed")
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .first();

      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "b.id",
          "b.booking_reference",
          this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
          this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
          this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
          "b.booking_type",
          "b.status",
          "b.total_amount",
          "b.vat",
          "b.source_id",
          "src.name as source_name",
          "b.company_name",
          "b.pickup",
          "b.pickup_from",
          "b.pickup_time",
          "b.drop",
          "b.drop_time",
          "b.drop_to",
          "b.visit_purpose",
          "b.comments",
          "b.discount_amount",
          "b.service_charge",
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "g.email as guest_email",
          this.db.raw(
            `
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`,
            [
              "hotel_reservation.booking_rooms",
              "hotel_reservation.room_types",
              "hotel_reservation.rooms",
            ]
          )
        )
        .leftJoin("sources as src", "b.source_id", "src.id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("b.check_in", current_date)
        .andWhere("b.status", "confirmed")
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0)
        .orderBy("b.id", "desc");

      return {
        data,
        total: total ? parseInt(total.total as string) : 0,
      };
    } else if (booking_mode == "departure") {
      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "b.id",
          "b.booking_reference",
          this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
          this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
          this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
          "b.booking_type",
          "b.status",
          "b.source_id",
          "src.name as source_name",
          "b.company_name",
          "b.pickup",
          "b.pickup_from",
          "b.pickup_time",
          "b.drop",
          "b.drop_time",
          "b.drop_to",
          "b.visit_purpose",
          "b.comments",
          "b.total_amount",
          "b.vat",
          "b.discount_amount",
          "b.service_charge",
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "g.email as guest_email",
          this.db.raw(
            `
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`,
            [
              "hotel_reservation.booking_rooms",
              "hotel_reservation.room_types",
              "hotel_reservation.rooms",
            ]
          )
        )
        .leftJoin("sources as src", "b.source_id", "src.id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("b.check_out", current_date)
        .andWhere("b.status", "checked_in")
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0)
        .orderBy("b.id", "desc");

      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .count("b.id as total")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere("b.status", "checked_in")
        .andWhere("b.check_out", current_date)
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .first();
      return {
        data,
        total: total ? parseInt(total.total as string) : 0,
      };
    } else {
      const data = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .select(
          "b.id",
          "b.booking_reference",
          this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
          this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
          this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
          "b.booking_type",
          "b.status",
          "b.source_id",
          "src.name as source_name",
          "b.company_name",
          "b.pickup",
          "b.pickup_from",
          "b.pickup_time",
          "b.drop",
          "b.drop_time",
          "b.drop_to",
          "b.visit_purpose",
          "b.comments",
          "b.total_amount",
          "b.vat",
          "b.discount_amount",
          "b.service_charge",
          "g.id as guest_id",
          "g.first_name",
          "g.last_name",
          "g.email as guest_email",
          this.db.raw(
            `
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`,
            [
              "hotel_reservation.booking_rooms",
              "hotel_reservation.room_types",
              "hotel_reservation.rooms",
            ]
          )
        )
        .leftJoin("sources as src", "b.source_id", "src.id")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere(function () {
          this.where("b.check_out", ">", current_date).andWhere(
            "b.check_in",
            "<=",
            current_date
          );
        })
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .andWhere("b.status", "checked_in")
        .limit(limit ? parseInt(limit) : 50)
        .offset(skip ? parseInt(skip) : 0)
        .orderBy("b.id", "desc");

      const total = await this.db("bookings as b")
        .withSchema(this.RESERVATION_SCHEMA)
        .count("b.id as total")
        .leftJoin("guests as g", "b.guest_id", "g.id")
        .where("b.hotel_code", hotel_code)
        .andWhere(function () {
          this.where("b.check_out", ">", current_date).andWhere(
            "b.check_in",
            "<=",
            current_date
          );
        })
        .andWhere(function () {
          if (search) {
            this.andWhere("b.booking_reference", "ilike", `%${search}%`)
              .orWhere("g.first_name", "ilike", `%${search}%`)
              .orWhere("g.email", "ilike", `%${search}%`);
          }
        })
        .andWhere("b.status", "checked_in")
        .first();
      return {
        data,
        total: total ? parseInt(total.total as string) : 0,
      };
    }
  }
}
