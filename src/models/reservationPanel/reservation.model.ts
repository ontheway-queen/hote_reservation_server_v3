import {
  IBookingRooms,
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
        this.db.raw(`COALESCE(SUM(ra.available_rooms), 0) AS available_rooms`)
      )
      .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
      .where("rt.hotel_code", hotel_code)
      .andWhere("ra.date", ">=", check_in)
      .andWhere("ra.date", "<", check_out)
      .groupBy("rt.id");
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
        "rt.name as room_type_name",
        "rt.base_price as room_type_base_price"
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
    return await this.db("room_booking")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // insert booking rooms
  public async insertBookingRoom(payload: IBookingRooms[]) {
    return await this.db("booking_rooms")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }
}
