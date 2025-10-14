import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantHotelModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getAllBooking({
    hotel_code,
    limit,
    search,
    skip,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
    search?: string;
  }) {
    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = skip ? Number(skip) : 0;

    const data = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id as booking_id",
        "b.hotel_code",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        "b.booking_type",
        "b.status",
        "b.is_individual_booking",
        "g.id as guest_id",
        this.db.raw(`CONCAT(g.first_name, ' ', g.last_name) as guest_name`),
        "g.email as guest_email",
        "g.phone as guest_phone",
        "br.id as booking_room_id",
        "br.room_id",
        "r.room_name",
        "br.room_type_id",
        "rt.name as room_type_name"
      )
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
      .leftJoin("room_types as rt", "br.room_type_id", "rt.id")
      .leftJoin("rooms as r", "br.room_id", "r.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.booking_type", "B")
      .andWhere("b.status", "checked_in")
      .andWhere(function () {
        if (search) {
          this.andWhere(function () {
            this.where("b.booking_reference", "ilike", `%${search}%`).orWhere(
              "g.phone",
              "ilike",
              `%${search}%`
            );
          });
        }
      })
      .orderBy("b.id", "desc")
      .limit(limitNum)
      .offset(offsetNum);

    const total = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .countDistinct("b.id as total")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.booking_type", "B")
      .andWhere("b.status", "checked_in")
      .andWhere(function () {
        if (search) {
          this.andWhere(function () {
            this.where("b.booking_reference", "ilike", `%${search}%`).orWhere(
              "g.phone",
              "ilike",
              `%${search}%`
            );
          });
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }
}

export default RestaurantHotelModel;
