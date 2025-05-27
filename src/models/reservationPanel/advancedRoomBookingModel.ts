import { IupdateRoomBooking } from "../../appAdmin/utlis/interfaces/advancedRoomBooking.interface";
import {
  IBookingRooms,
  IrefundRoomBooking,
  IRoomBookingBody,
} from "../../appAdmin/utlis/interfaces/reservation.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class AdvancedRoomBookingModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // insert room booking
  public async insertRoomBooking(payload: IRoomBookingBody) {
    return await this.db("advanced_room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // insert booking rooms
  public async insertBookingRoom(payload: IBookingRooms[]) {
    return await this.db("ad_booking_room_types")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // get all room booking
  public async getAllRoomBooking(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    from_date?: string;
    to_date?: string;
    pay_status?: number;
    reserved_room?: number;
    hotel_code: number;
    status?: string;
    user_id?: string;
  }) {
    const {
      limit,
      skip,
      hotel_code,
      name,
      from_date,
      to_date,
      status,
      user_id,
    } = payload;

    const dtbs = this.db("ad_room_booking_view");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate());

    const last24Hours = new Date();
    last24Hours.setDate(last24Hours.getDate() - 1);

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "id",
        "booking_no",
        "user_id",
        "name",
        "photo",
        "email",
        "phone",
        "check_in_time",
        "check_out_time",
        "number_of_nights",
        "extra_charge",
        "grand_total",
        "no_payment",
        "partial_payment",
        "full_payment",
        "pay_status",

        "reserved_room",
        "created_by_id",
        "created_by_name",
        "status"
      )
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (name) {
          this.andWhere("name", "like", `%${name}%`)
            .orWhere("email", "like", `%${name}%`)
            .orWhere("phone", "like", `%${name}%`);
          // .orWhereRaw(
          //   "JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?",
          //   [`%${name}%`]
          // );
        }
        if (user_id) {
          this.andWhere("user_id", user_id);
        }
        if (status) {
          this.andWhere("status", status);
        }
        if (from_date && to_date) {
          this.andWhereBetween("check_in_time", [from_date, endDate]);
        }
      })
      .orderBy(".id", "desc");

    const total = await this.db("ad_room_booking_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (name) {
          this.andWhere("name", "like", `%${name}%`)
            .orWhere("email", "like", `%${name}%`)
            .orWhere("phone", "like", `%${name}%`);
          // .orWhereRaw(
          //   "JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?",
          //   [`%${name}%`]
          // );
        }
        if (user_id) {
          this.andWhere("user_id", user_id);
        }
        if (status) {
          this.andWhere("status", status);
        }
        if (from_date && to_date) {
          this.andWhereBetween("check_in_time", [from_date, endDate]);
        }
      });

    return { data, total: total[0].total };
  }

  // get single room booking
  public async getSingleRoomBooking(id: number, hotel_code: number) {
    return await this.db("ad_room_booking_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ id })
      .andWhere({ hotel_code });
  }

  // get last room booking id
  public async getLastAdRoomBookingId(hotel_code: number) {
    return await this.db("advanced_room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .where({ hotel_code })
      .orderBy("id", "desc")
      .limit(1);
  }

  // update room booking
  public async updateRoomBooking(
    payload: {
      pay_status?: number;
      no_payment?: number;
      partial_payment?: number;
      is_confirmed?: number;
      full_payment?: number;
      status?: string;
      reserved_room?: number;
      extra_charge?: number;
      sub_total?: number;
      grand_total?: number;
    },
    where: { id: number }
  ) {
    const { id } = where;
    return await this.db("advanced_room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // update room booking
  public async updateRoomBookingPayStatus(payload: {
    id: number;
    hotel_code: number;
    pay_status: number;
    reserved_room: number;
  }) {
    return await this.db("room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload);
  }

  // update booking room
  public async updateBookingRoom(payload: IupdateRoomBooking, id: number) {
    return await this.db("room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // Get single room booking by invoice id
  public async updateRoomBookingByInvoiceId(id: number, hotel_code: number) {
    return await this.db("room_booking_invoice_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .update("room_booking_inv_id", id)
      .andWhere({ hotel_code });
  }

  // refund room booking
  public async refundRoomBooking(
    payload: IrefundRoomBooking,
    where: { id: number }
  ) {
    return await this.db("room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id: where.id });
  }

  // get all room booking by room id
  public async getAllRoomBookingByRoomId(
    hotel_code: number,
    room_number: number
  ) {
    return await this.db.raw(`
    SELECT id as booking_id,booking_no,user_id,name,photo,status,grand_total FROM hotel_reservation.room_booking_view 
    WHERE JSON_CONTAINS(booking_rooms, '{"room_id": ${room_number}}')
    AND hotel_code = ${hotel_code} AND status NOT IN ('left', 'rejected')
  `);
  }

  // insert room booking check in
  public async insertRoomBookingCheckIn(payload: {
    booking_id: number;
    check_in: string;
    created_by: number;
  }) {
    return await this.db("ad_booking_check_in_out")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // Update room booking check in
  public async updateRoomBookingCheckIn(
    payload: { check_in: string },
    id: number
  ) {
    return await this.db("ad_booking_check_in_out")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // add room booking check out
  public async addRoomBookingCheckOut(
    payload: { check_out: string; status: string },
    id: number
  ) {
    return await this.db("booking_check_in_out")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // get single check in checkout
  public async getSingleRoomBookingCheckIn(id: number, hotel_code: number) {
    return await this.db("check_in_out_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ hotel_code })
      .andWhere({ id });
  }

  public async getRoomCheckInOutStatusByBookingID(
    id: number,
    hotel_code: number
  ) {
    return await this.db("check_in_out_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ hotel_code })
      .andWhere("booking_id", id);
  }

  // get all check in checkout
  public async getAllRoomBookingCheckIn(payload: {
    hotel_code: number;
    booking_id?: number;
    from_date?: string;
    to_date?: string;
    limit?: string;
    skip?: string;
    key?: string;
  }) {
    const { limit, skip, hotel_code, key, booking_id, from_date, to_date } =
      payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("booking_check_in_out as bco");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "bco.id",
        "u.name as guest_name",
        "b.id as booking_id",
        "b.check_out_time",
        "b.booking_no",
        "bco.check_in",
        "bco.check_out",
        "bco.status",
        "bco.created_at"
      )

      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("room_booking as b", "bco.booking_id", "b.id")
      .leftJoin("user as u", "b.user_id", "u.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("b.booking_no", "like", `%${key}%`);
        }
      })

      .andWhere(function () {
        if (booking_id) {
          this.andWhere("b.id", booking_id);
        }

        if (from_date && to_date) {
          this.andWhereBetween("bco.created_at", [from_date, endDate]);
        }
      })
      .orderBy("bco.id", "desc");

    const total = await this.db("booking_check_in_out as bco")
      .count("bco.id as total")
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("room_booking as b", "bco.booking_id", "b.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("b.booking_no", "like", `%${key}%`);
        }
      })

      .andWhere(function () {
        if (booking_id) {
          this.andWhere("b.id", booking_id);
        }

        if (from_date && to_date) {
          this.andWhereBetween("bco.created_at", [from_date, endDate]);
        }
      });

    return {
      data,
      total: total[0].total,
    };
  }
}
export default AdvancedRoomBookingModel;
