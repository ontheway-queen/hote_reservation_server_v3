import {
  IcreateRoomPayload,
  IgetRoomAvailabilitiesByRoomTypeId,
  IinsertRoomAvailabilitiesPayload,
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
  }) {
    const {
      limit,
      skip,
      hotel_code,
      room_type_id,
      search,
      exact_name,
      status,
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
      .where(function () {
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
      })
      .orderBy("r.room_name", "asc");

    const total = await this.db("rooms as r")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("r.id as total")
      .join("room_types as rt", "r.room_type_id", "rt.id")
      .where(function () {
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
    console.log({ totalGuests });
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

    console.log("here");

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
      .andWhere("rt.hotel_code", hotel_code)
      .groupBy("rt.id", "rt.name")
      .orderBy("rt.name", "asc");

    const total = await this.db("room_types as rt")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rt.id as total")
      .leftJoin("rooms as r", "rt.id", "r.room_type_id")
      .where("rt.is_active", true)
      .where("rt.hotel_code", hotel_code)
      .andWhereNot("r.status", "out_of_service")
      .orderBy("rt.name", "asc")
      .groupBy("rt.id", "r.room_type_id");

    return { data, total: total[0]?.total };
  }

  public async getSingleRoom(hotel_code: number, room_id: number) {
    return await this.db("rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
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

  // update hotel room
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
}
export default RoomModel;
