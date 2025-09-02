import { IgetAllChannel } from "../../appAdmin/utlis/interfaces/channelManager.types";
import { IAvailableRoomType } from "../../appAdmin/utlis/interfaces/reservation.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ChannelManagerModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getAllTodayAvailableRoomsTypeWithRoomCount(payload: {
    check_in: string;
    check_out: string;
    hotel_code: number;
    room_type_id?: number;
    exclude_booking_id?: number;
  }): Promise<IAvailableRoomType[]> {
    const { hotel_code, check_in, check_out, room_type_id } = payload;
    console.log({ payload });
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
      .andWhere("ra.date", "<=", check_out)
      .andWhere(function () {
        if (room_type_id) {
          this.andWhere("rt.id", room_type_id);
        }
      })
      .groupBy("rt.id", "rt.name", "rt.description", "rt.hotel_code")
      .having(this.db.raw("MIN(ra.available_rooms) > 0"));
  }

  public async addChannelManager(payload: {
    name: string;
    hotel_code: number;
    is_internal: boolean;
  }) {
    return await this.db("channels").withSchema(this.CM_SCHEMA).insert(payload);
  }

  public async getAllChannelManager({
    hotel_code,
    is_internal,
  }: {
    hotel_code: number;
    is_internal?: boolean;
  }): Promise<IgetAllChannel[] | []> {
    return await this.db("channels")
      .withSchema(this.CM_SCHEMA)
      .select("id", "name", "is_internal")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (is_internal) {
          this.andWhere("is_internal", is_internal);
        }
      });
  }

  public async getSingleChannel(id: number, hotel_code: number) {
    return await this.db("channels")
      .withSchema(this.CM_SCHEMA)
      .select("*")
      .where({ id })
      .andWhere({ hotel_code })
      .first();
  }

  public async updateChannelManager(
    payload: {
      name: string;
      is_internal: boolean;
    },
    conditions: { id: number; hotel_code: number }
  ) {
    return await this.db("channels")
      .withSchema(this.CM_SCHEMA)
      .update(payload)
      .where(conditions);
  }

  public async insertInChannelAllocation(
    payload: {
      hotel_code: number;
      room_type_id: number;
      channel_id: number;
      date: string;
      allocated_rooms: number;
    }[]
  ) {
    return await this.db("channel_allocations")
      .withSchema(this.CM_SCHEMA)
      .insert(payload);
  }

  public async updateRoomAvailabilityForChannelAllocation({
    type,
    hotel_code,
    room_type_id,
    date,
    total_rooms,
  }: {
    type: "allocate" | "deallocate ";
    hotel_code: number;
    room_type_id: number;
    date: string;
    total_rooms: number;
  }) {
    if (type === "allocate") {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms - ?", [total_rooms]),
          channel_manager_rooms: this.db.raw("channel_manager_rooms + ?", [
            total_rooms,
          ]),
          updated_at: this.db.fn.now(),
        });
    } else {
      return await this.db("room_availability")
        .withSchema(this.RESERVATION_SCHEMA)
        .where({ hotel_code, room_type_id, date })
        .update({
          available_rooms: this.db.raw("available_rooms + ?", [total_rooms]),
          channel_manager_rooms: this.db.raw("channel_manager_rooms - ?", [
            total_rooms,
          ]),
          updated_at: this.db.fn.now(),
        });
    }
  }

  public async insertInChannelRatePlans(
    payload: {
      hotel_code: number;
      room_type_id: number;
      channel_id: number;
      rate_plan_id: number;
    }[]
  ) {
    return await this.db("channel_rate_plans")
      .withSchema(this.CM_SCHEMA)
      .insert(payload);
  }

  public async bulkUpdateRoomAvailabilityForChannel({
    type,
    hotel_code,
    room_type_id,
    updates, // [{ date: string, total_rooms: number }]
  }: {
    type: "allocate" | "deallocate";
    hotel_code: number;
    room_type_id: number;
    updates: { date: string; total_rooms: number }[];
  }) {
    if (!updates.length) return;

    // build CASE statements for available_rooms and channel_manager_rooms
    const availableCases: string[] = [];
    const channelCases: string[] = [];
    const dates: string[] = [];

    updates.forEach((u) => {
      dates.push(u.date);
      if (type === "allocate") {
        availableCases.push(
          `WHEN date = '${u.date}' THEN available_rooms - ${u.total_rooms}`
        );
        channelCases.push(
          `WHEN date = '${u.date}' THEN channel_manager_rooms + ${u.total_rooms}`
        );
      } else {
        availableCases.push(
          `WHEN date = '${u.date}' THEN available_rooms + ${u.total_rooms}`
        );
        channelCases.push(
          `WHEN date = '${u.date}' THEN channel_manager_rooms - ${u.total_rooms}`
        );
      }
    });

    const rawQuery = `
    UPDATE ${this.RESERVATION_SCHEMA}.room_availability
    SET
      available_rooms = CASE ${availableCases.join(
        " "
      )} ELSE available_rooms END,
      channel_manager_rooms = CASE ${channelCases.join(
        " "
      )} ELSE channel_manager_rooms END,
      updated_at = NOW()
    WHERE hotel_code = ${hotel_code}
      AND room_type_id = ${room_type_id}
      AND date IN (${dates.map((d) => `'${d}'`).join(",")});
  `;

    return await this.db.raw(rawQuery);
  }

  public async getSingleChannelAllocation({
    hotel_code,
    room_type_id,
    channel_id,
    date,
  }: {
    hotel_code: number;
    room_type_id: number;
    channel_id: number;
    date: string;
  }): Promise<{
    id: number;
    room_type_id: number;
    channel_id: number;
    date: string;
    allocated_rooms: number;
  }> {
    return await this.db("channel_allocations")
      .select("id", "room_type_id", "channel_id", "date", "allocated_rooms")
      .where({ hotel_code, room_type_id, channel_id, date })
      .withSchema(this.CM_SCHEMA)
      .first();
  }

  public async updateChannelAllocation({
    id,
    allocated_rooms,
  }: {
    id: number;
    allocated_rooms: number;
  }) {
    return await this.db("channel_allocations")
      .withSchema(this.CM_SCHEMA)
      .where({ id })
      .update({ allocated_rooms, updated_at: new Date() });
  }

  public async getChannelRoomAllocations({
    hotel_code,
    current_date,
  }: {
    hotel_code: number;
    current_date: string;
  }) {
    return await this.db("channels as c")
      .withSchema(this.CM_SCHEMA)
      .select(
        "c.id as channel_id",
        "c.name as channel_name",
        this.db.raw(
          `
        COALESCE(
          json_agg(
            json_build_object(
              'room_type_id', rt.id,
              'room_type_name', rt.name,
              'allocated_rooms', ca.allocated_rooms,
              'sold_rooms', ca.sold_rooms
            )
          ) FILTER (WHERE rt.id IS NOT NULL), '[]'
        ) as room_types
        `
        )
      )
      .leftJoin(`channel_allocations as ca`, function () {
        this.on("ca.channel_id", "c.id")
          .andOn("ca.hotel_code", "c.hotel_code")
          .andOnVal("ca.date", current_date);
      })
      .joinRaw(
        "LEFT JOIN hotel_reservation.room_types as rt ON rt.id=ca.room_type_id"
      )
      .where("c.hotel_code", hotel_code)
      .groupBy("c.id", "c.name");
  }
}
export default ChannelManagerModel;
