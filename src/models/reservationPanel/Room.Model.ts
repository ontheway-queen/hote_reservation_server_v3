import {
  IcreateRoomPayload,
  IgetRoomAvailabilitiesByRoomTypeId,
  IinsertRoomAvailabilitiesPayload,
  IOccupiedRoomList,
  IUpdateRoomAvailabilitiesPayload,
  IupdateRoomBody,
} from "../../appAdmin/utlis/interfaces/Room.interfaces";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RoomModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // create room
  public async createRoom(payload: IcreateRoomPayload) {
    return await this.db("rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getAllRoom(payload: {
    hotel_code: number;
    search?: string;
    status?: string;
    room_type_id?: number;
    limit?: string;
    skip?: string;
    exact_name?: string;
    room_ids?: number[];
  }): Promise<{
    data: {
      id: number;
      hotel_code: number;
      room_name: number;
      floor_nor: string;
      room_type_id: number;
      status: string;
      room_type_name: string;
    }[];
    total: number;
  }> {
    const {
      limit,
      skip,
      hotel_code,
      room_type_id,
      search,
      exact_name,
      status,
      room_ids,
    } = payload;

    const dtbs = this.db("rooms as r");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "r.id",
        "r.hotel_code",
        "r.room_name",
        "r.floor_no",
        "r.room_type_id",
        "r.status",
        "rt.name as room_type_name"
      )
      .join("room_types as rt", "r.room_type_id", "rt.id")
      .andWhere("r.is_deleted", false)
      .andWhere(function () {
        this.andWhere("r.hotel_code", hotel_code);
        if (exact_name) {
          this.andWhereRaw("LOWER(r.room_name) = ?", [
            exact_name.toLowerCase(),
          ]);
        }
        if (search) {
          this.andWhere("r.room_name", "ilike", `%${search}%`);
        }

        if (room_type_id) {
          this.andWhere("r.room_type_id", room_type_id);
        }
        if (status) {
          this.andWhere("r.status", status);
        }

        if (room_ids?.length) {
          this.whereIn("r.id", room_ids);
        }
      })
      .orderBy("r.room_name", "asc");

    const total = await this.db("rooms as r")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("r.id as total")
      .join("room_types as rt", "r.room_type_id", "rt.id")
      .where(function () {
        this.andWhere("r.hotel_code", hotel_code);
        if (search) {
          this.andWhere("r.room_name", "ilike", `%${search}%`);
        }

        if (exact_name) {
          this.andWhereRaw("LOWER(r.room_name) = ?", [
            exact_name.toLowerCase(),
          ]);
        }
        if (room_type_id) {
          this.andWhere("r.room_type_id", room_type_id);
        }

        if (status) {
          this.andWhere("r.status", status);
        }
        if (room_ids?.length) {
          this.whereIn("r.id", room_ids);
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }

  public async getAllAvailableRooms(payload: {
    hotel_code: number;
    check_in: string; // required: "YYYY-MM-DD"
    check_out: string; // required: "YYYY-MM-DD"
    adult?: number;
    child?: number;
    limit?: string;
    skip?: string;
  }) {
    const { hotel_code, adult, child, check_in, check_out, limit, skip } =
      payload;

    const totalGuests = (adult ?? 1) + (child ?? 0);

    // Calculate number of nights
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const number_of_nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (number_of_nights <= 0) {
      throw new Error("Invalid check-in and check-out date range");
    }

    const rooms = await this.db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rt.id",
        "rt.name",
        "rt.base_occupancy",
        "rt.max_occupancy",
        "rt.max_adults",
        "rt.max_children",
        "rt.base_price"
      )
      .leftJoin("room_availability as ra", function () {
        this.on("ra.room_type_id", "=", "rt.id")
          .andOn("ra.hotel_code", "=", "rt.hotel_code")
          .andOnBetween("ra.date", [check_in, check_out]);
      })
      .where("rt.is_active", true)
      .andWhere("rt.is_available", true)
      .andWhere("rt.hotel_code", hotel_code)
      .andWhere("rt.base_occupancy", "<=", totalGuests)
      .andWhere("rt.max_occupancy", ">=", totalGuests)
      .andWhere("rt.max_adults", ">=", adult ?? 1)
      .andWhere("rt.max_children", ">=", child ?? 0)
      .groupBy("rt.id")
      .havingRaw("COUNT(ra.id) = ?", [number_of_nights])
      .havingRaw("MIN(ra.available_rooms) > 0")
      .orderBy("rt.name", "asc")
      .modify((qb) => {
        if (limit) qb.limit(parseInt(limit));
        if (skip) qb.offset(parseInt(skip));
      });

    return {
      data: rooms,
      total: rooms.length,
    };
  }

  public async getAllRoomByRoomTypes(payload: {
    hotel_code: number;
    search?: string;
    room_type_id?: number;
    limit?: string;
    skip?: string;
    exact_name?: string;
  }) {
    const { limit, skip, hotel_code, room_type_id, search, exact_name } =
      payload;

    const dtbs = this.db("room_types as rt");

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rt.id",
        "rt.name",
        "rt.name as room_type_name",
        this.db.raw(
          `COALESCE(
          JSON_AGG(
            CASE
              WHEN r.id IS NOT NULL AND r.status != 'out_of_service' THEN
                JSON_BUILD_OBJECT('id', r.id, 'room_name', r.room_name, 'status', r.status)
            END
          ) FILTER (WHERE r.id IS NOT NULL AND r.status != 'out_of_service'),
          '[]'
        ) AS rooms`
        )
      )
      .from("room_types as rt")
      .leftJoin("rooms as r", "rt.id", "r.room_type_id")
      .where("rt.is_active", true)
      .andWhere("rt.is_deleted", false)
      .andWhere("rt.hotel_code", hotel_code)
      .groupBy("rt.id", "rt.name")
      .orderBy("rt.name", "asc");

    const total = await this.db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rt.id as total")
      .leftJoin("rooms as r", "rt.id", "r.room_type_id")
      .where("rt.is_active", true)
      .where("rt.hotel_code", hotel_code)
      .andWhere("rt.is_deleted", false)
      .andWhereNot("r.status", "out_of_service")
      .orderBy("rt.name", "asc")
      .groupBy("rt.id", "r.room_type_id");

    return { data, total: total[0]?.total };
  }

  public async getSingleRoom(
    hotel_code: number,
    room_id: number
  ): Promise<
    {
      id: number;
      room_name: string;
      floor_no: string;
      room_type_id: number;
      status: string;
    }[]
  > {
    return await this.db("rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "room_name", "floor_no", "room_type_id", "status")
      .where({ hotel_code })
      .andWhere({ id: room_id });
  }

  public async insertInRoomAvilabilities(
    payload: IinsertRoomAvailabilitiesPayload[]
  ) {
    console.log({ payload });
    return await this.db("room_availability")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async deleteInRoomAvailabilities({
    hotel_code,
    room_type_id,
  }: {
    hotel_code: number;
    room_type_id: number;
  }) {
    return await this.db("room_availability")
      .withSchema(this.RESERVATION_SCHEMA)
      .del()
      .where({ hotel_code })
      .andWhere({ room_type_id });
  }

  public async updateInRoomAvailabilities(
    hotel_code: number,
    room_type_id: number,
    payload: Partial<IUpdateRoomAvailabilitiesPayload>
  ) {
    return await this.db("room_availability")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ hotel_code })
      .andWhere({ room_type_id });
  }

  public async getRoomAvailabilitiesByRoomTypeId(
    hotel_code: number,
    room_type_id: number
  ): Promise<IgetRoomAvailabilitiesByRoomTypeId> {
    return await this.db("room_availability")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "total_rooms", "available_rooms")
      .where("hotel_code", hotel_code)
      .andWhere("room_type_id", room_type_id)
      .first();
  }

  public async updateRoom(
    roomId: number,
    hotel_code: number,
    payload: Partial<IupdateRoomBody>
  ) {
    return await this.db("rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id: roomId })
      .andWhere({ hotel_code });
  }

  public async getAllRoomByRoomStatus(payload: {
    hotel_code: number;
    status?: string;
    room_type_id?: number;
    current_date: string;
    limit?: string;
    skip?: string;
  }) {
    const { hotel_code, room_type_id, status, limit, skip, current_date } =
      payload;

    // old code which not suitable for sorting
    // const dtbs = this.db("rooms as r").withSchema(this.RESERVATION_SCHEMA);

    // const parsedLimit = parseInt(limit as string);
    // const parsedSkip = parseInt(skip as string);

    // if (!isNaN(parsedLimit) && !isNaN(parsedSkip)) {
    //   dtbs.limit(parsedLimit).offset(parsedSkip);
    // }

    // const data = await this.db
    //   .withSchema(this.RESERVATION_SCHEMA)
    //   .select(
    //     "r.floor_no",
    //     this.db.raw(
    //       `
    //   JSON_AGG(
    //     JSON_BUILD_OBJECT(
    //       'id', r.id,
    //       'hotel_code', r.hotel_code,
    //       'room_no', r.room_name,
    //       'floor_no', r.floor_no,
    //       'room_type_id', r.room_type_id,
    //       'status', r.status,
    //       'room_type_name', rt.name,
    //       'bookings', COALESCE((
    //         SELECT JSON_AGG(
    //           JSON_BUILD_OBJECT(
    //             'booking_id', b.id,
    //             'booking_reference', b.booking_reference,
    //             'check_in', b.check_in,
    //             'check_out', b.check_out,
    //             'booking_type', b.booking_type,
    //             'booking_status', b.status,
    //             'guest_first_name', g.first_name,
    //             'guest_last_name', g.last_name,
    //             'guest_id', g.id
    //           )
    //         )
    //         FROM hotel_reservation.booking_rooms br
    //         JOIN hotel_reservation.bookings b ON b.id = br.booking_id
    //         LEFT JOIN hotel_reservation.guests g ON g.id = b.guest_id
    //         WHERE br.room_id = r.id
    //         AND b.check_in <= ?
    //           AND b.check_out >= ?
    //           AND b.hotel_code = r.hotel_code
    //           AND b.booking_type = ?
    //           AND (b.status = ? OR b.status = ?)
    //       ), '[]')
    //     )
    //     ) AS rooms
    // `,
    //       [current_date, current_date, "B", "confirmed", "checked_in"]
    //     )
    //   )
    //   .from("rooms as r")
    //   .join("room_types as rt", "r.room_type_id", "rt.id")
    //   .where("r.hotel_code", hotel_code)
    //   .andWhere("r.is_deleted", false)
    //   .modify((qb) => {
    //     if (status) {
    //       qb.andWhere("r.status", status);
    //     }
    //     if (room_type_id) {
    //       qb.andWhere("r.room_type_id", room_type_id);
    //     }
    //   })
    //   .groupBy("r.floor_no")
    //   .orderBy("r.floor_no", "asc");

    // new code
    const data = await this.db.raw(
      `
      SELECT
        floor_no,
        JSON_AGG(room_obj ORDER BY room_no_int) AS rooms
      FROM (
        SELECT
          r.floor_no,
          CAST(r.room_name AS INTEGER) AS room_no_int,
          JSON_BUILD_OBJECT(
            'id', r.id,
            'hotel_code', r.hotel_code,
            'room_no', r.room_name,
            'floor_no', r.floor_no,
            'room_type_id', r.room_type_id,
            'status', r.status,
            'room_type_name', rt.name,
            'bookings', COALESCE((
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'booking_id', b.id,
                  'booking_reference', b.booking_reference,
                  'check_in', b.check_in,
                  'check_out', b.check_out,
                  'booking_type', b.booking_type,
                  'booking_status', b.status,
                  'guest_first_name', g.first_name,
                  'guest_last_name', g.last_name,
                  'guest_id', g.id
                )
              )
              FROM ${this.RESERVATION_SCHEMA}.booking_rooms br
              JOIN ${this.RESERVATION_SCHEMA}.bookings b ON b.id = br.booking_id
              LEFT JOIN ${this.RESERVATION_SCHEMA}.guests g ON g.id = b.guest_id
              WHERE br.room_id = r.id
                AND b.check_in <= ?
                AND b.check_out >= ?
                AND b.hotel_code = r.hotel_code
                AND b.booking_type = ?
                AND (b.status = ? OR b.status = ?)
            ), '[]')
          ) AS room_obj
        FROM ${this.RESERVATION_SCHEMA}.rooms r
        JOIN ${this.RESERVATION_SCHEMA}.room_types rt ON r.room_type_id = rt.id
        WHERE r.hotel_code = ?
          AND r.is_deleted = false
          ${status ? `AND r.status = '${status}'` : ""}
          ${room_type_id ? `AND r.room_type_id = '${room_type_id}'` : ""}
      ) AS sorted_rooms
      GROUP BY floor_no
      ORDER BY floor_no ASC
    `,
      [current_date, current_date, "B", "confirmed", "checked_in", hotel_code]
    );

    const total = await this.db("rooms as r")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("r.id as total")
      .join("room_types as rt", "r.room_type_id", "rt.id")
      .where("r.hotel_code", hotel_code)
      .andWhere("r.is_deleted", false)
      .where(function () {
        if (room_type_id) {
          this.andWhere("r.room_type_id", room_type_id);
        }
        if (status) {
          this.andWhere("r.status", status);
        }
      });

    return {
      data: data.rows,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }

  // get all rooms by room type
  public async getAllRoomByRoomType(
    hotel_code: number,
    id: number
  ): Promise<{
    data: {
      id: number;
      room_name: string;
      floor_no: number;
      status: string;
      created_by_id: number;
      created_by_name: string;
    }[];
    total: number;
  }> {
    const data = await this.db("rooms as r")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "r.id",
        "r.room_name",
        "r.floor_no",
        "r.status",
        "ua.id as created_by_id",
        "ua.name as created_by_name"
      )
      .join("user_admin as ua", "ua.id", "r.created_by")
      .where("r.room_type_id", id)
      .andWhere("r.is_deleted", false)
      .andWhere("r.hotel_code", hotel_code);

    const total = await this.db("rooms as r")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("r.id as total")
      .where("r.room_type_id", id)
      .andWhere("r.is_deleted", false)
      .andWhere("r.hotel_code", hotel_code);

    return {
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
      data,
    };
  }

  // Get all occupied rooms using a specific date
  public async getAllOccupiedRooms(
    date: string
  ): Promise<{ data: IOccupiedRoomList[]; total: number }> {
    const rows = await this.db("booking_rooms as br")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "r.id as room_id",
        "r.hotel_code",
        "r.room_name as room_no",
        "r.floor_no",
        "r.status",
        "rt.id as room_type_id",
        "rt.name as room_type_name",
        "bk.id as booking_id",
        "bk.booking_reference",
        "bk.check_in",
        "bk.check_out",
        "bk.booking_type",
        "bk.status as booking_status",
        "g.first_name as guest_first_name",
        "g.last_name as guest_last_name",
        "g.id as guest_id"
      )
      .join("bookings as bk", "bk.id", "br.booking_id")
      .leftJoin("rooms as r", "r.id", "br.room_id")
      .leftJoin("guests as g", "g.id", "bk.guest_id")
      .join("room_types as rt", "rt.id", "br.room_type_id")
      .where((qb) => {
        qb.where("bk.status", "checked_in").orWhere("bk.status", "confirmed");
      })
      .andWhere("bk.check_in", "<=", date)
      .andWhere("bk.check_out", ">", date)
      .andWhere("r.is_deleted", false)
      .orderBy("r.id", "asc");

    const grouped = rows.reduce((acc, row) => {
      let room = acc.find((r: any) => r.id === row.room_id);
      if (!room) {
        room = {
          id: row.room_id,
          hotel_code: row.hotel_code,
          room_no: row.room_no,
          floor_no: row.floor_no,
          room_type_id: row.room_type_id,
          room_type_name: row.room_type_name,
          status: row.status,
          bookings: [],
        };
        acc.push(room);
      }
      room.bookings.push({
        booking_id: row.booking_id,
        booking_reference: row.booking_reference,
        check_in: row.check_in,
        check_out: row.check_out,
        booking_type: row.booking_type,
        booking_status: row.booking_status,
        guest_first_name: row.guest_first_name,
        guest_last_name: row.guest_last_name,
        guest_id: row.guest_id,
      });
      return acc;
    }, [] as any[]);

    return {
      total: grouped.length,
      data: grouped,
    };
  }
}
export default RoomModel;
