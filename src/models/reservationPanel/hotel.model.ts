import {
  ICreateHotelPayload,
  ICreateHotelUserPayload,
  IgetAllHotelUserPayload,
  IinsertHotelsOtherInfoPayload,
  IsingleHotelUserPayload,
  IupdateHotelUser,
} from "../../appM360/utlis/interfaces/mUserHotel.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HotelModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // create hotel
  public async createHotel(payload: ICreateHotelPayload) {
    console.log(payload);
    return await this.db("hotels")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // insert in hotels other info
  public async insertHotelOtherInfo(payload: IinsertHotelsOtherInfoPayload) {
    return await this.db("hotel_others_info")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async insertHotelImages(
    body: {
      hotel_code: number;
      image_url: string;
      image_caption?: string;
      main_image: string;
    }[]
  ) {
    return await this.db("hotel_images")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(body);
  }

  // get all hotel
  public async getAllHotel(payload: IgetAllHotelUserPayload) {
    const { from_date, to_date, name, status, limit, skip } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("hotels as h");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "h.id",
        "h.hotel_code",
        "h.name",
        "h.address",
        "h.star_category",
        "h.city_code",
        "h.country_code",
        "h.accommodation_type_id",
        "h.accommodation_type_name",
        "h.created_at",
        "hcd.email",
        "hoi.status",
        "hoi.logo",
        "hoi.expiry_date",
        "h.created_at"
      )
      .leftJoin("hotel_others_info as hoi", "h.hotel_code", "hoi.hotel_code")
      .leftJoin(
        "hotel_contact_details as hcd",
        "h.hotel_code",
        "hcd.hotel_code"
      )
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("h.created_at", [from_date, endDate]);
        }
        if (name) {
          this.andWhere("h.name", "like", `%${name}%`).orWhere(
            "h.chain_name",
            "like",
            `%${name}%`
          );
        }
        if (status) {
          this.andWhere("hoi.status", status);
        }
      })
      .orderBy("id", "desc");

    const total = await this.db("hotels as h")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("h.id AS total")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("h.created_at", [from_date, endDate]);
        }
        if (name) {
          this.andWhere("h.name", "like", `%${name}%`).orWhere(
            "h.chain_name",
            "like",
            `%${name}%`
          );
        }
        if (status) {
          this.andWhere("hoi.status", status);
        }
      });

    return {
      data,
      total: total[0].total,
    };
  }

  public async getHotelLastId() {
    const hotels = await this.db("hotels")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .limit(1)
      .orderBy("id", "desc");

    return hotels.length ? hotels[0].id : 1;
  }

  // get single hotel
  public async getSingleHotel(payload: IsingleHotelUserPayload) {
    const { id, email } = payload;
    return await this.db("hotels")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where(function () {
        if (id) {
          this.andWhere({ id });
        }
        if (email) {
          this.andWhere({ email });
        }
      });
  }

  // update hotel
  public async updateHotel(
    payload: IupdateHotelUser,
    where: { id?: number; email?: string }
  ) {
    const { email, id } = where;
    return await this.db("hotel")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where(function () {
        if (id) {
          this.where({ id });
        } else if (email) {
          this.where({ email });
        }
      });
  }

  // insert hotel images
  public async insertHotelImage(
    payload: { photo: string; hotel_code: number }[]
  ) {
    return await this.db("hotel_images")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // delete hotel images
  public async deleteHotelImage(payload: [], hotel_code: number) {
    return await this.db("hotel_images")
      .withSchema(this.RESERVATION_SCHEMA)
      .delete()
      .whereIn("id", payload)
      .andWhere("hotel_code", hotel_code);
  }

  // insert hotel amnities
  public async insertHotelAmnities(
    payload: { name: string; hotel_code: number }[]
  ) {
    return await this.db("hotel_aminities")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // delete hotel amnities
  public async deleteHotelAmnities(payload: [], hotel_code: number) {
    return await this.db("hotel_aminities")
      .withSchema(this.RESERVATION_SCHEMA)
      .delete()
      .whereIn("id", payload)
      .andWhere("hotel_code", hotel_code);
  }
}

export default HotelModel;
