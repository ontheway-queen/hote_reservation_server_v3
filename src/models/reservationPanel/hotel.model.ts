import { Part } from "@aws-sdk/client-s3";
import { ISingleHotel } from "../../appM360/utlis/interfaces/mHotel.common.interface";
import {
  ICreateHotelPayload,
  ICreateHotelUserPayload,
  IgetAllHotelUserPayload,
  IinsertHotelsCDPayload,
  IupdateHotelUser,
} from "../../appM360/utlis/interfaces/mUserHotel.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";
import { IAccountConfigHeads } from "../../utils/miscellaneous/constants";

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
      .insert(payload, "id");
  }

  public async insertHotelContactDetails(payload: IinsertHotelsCDPayload) {
    return await this.db("hotel_contact_details")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async updateHotelContactDetails(
    payload: Partial<{
      phone: string;
      fax: string;
      website_url: string;
      email: string;
      logo: string;
      bin: string;
    }>,
    hotel_code: number
  ) {
    return await this.db("hotel_contact_details")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ hotel_code });
  }

  public async insertHotelImages(
    body: {
      hotel_code: number;
      image_url: string;
      image_caption?: string;
      main_image?: string;
    }[]
  ) {
    return await this.db("hotel_image")
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
        "h.status",
        "hcd.logo",
        "h.expiry_date",
        "h.created_at"
      )
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
  public async getSingleHotel(payload: {
    id?: number;
    email?: string;
    hotel_code?: number;
  }): Promise<ISingleHotel | undefined> {
    const { hotel_code, email, id } = payload;
    return await this.db("hotels as h")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "h.id",
        "h.hotel_code",
        "h.name as hotel_name",
        "h.address",
        "h.star_category",
        "h.city_code",
        "h.country_code",
        "h.accommodation_type_id",
        "h.accommodation_type_name",
        "h.created_at",
        "h.latitude",
        "h.longitude",
        "h.chain_name",
        "h.postal_code",
        "h.description",
        "h.star_category",
        "h.created_at",
        "h.status",
        "h.expiry_date",
        "h.created_at",
        "hcd.logo",
        "hcd.fax",
        "hcd.website_url",
        "hcd.email as hotel_email",
        "hcd.phone",
        "hcd.optional_phone1",
        "h.bin",
        this.db.raw(
          `(SELECT json_agg(
      json_build_object(
        'id', hi.id,
        'image_url', hi.image_url,
        'image_caption', hi.image_caption,
        'main_image', hi.main_image
      )
    )
    FROM hotel_reservation.hotel_image hi
    WHERE hi.hotel_code = h.hotel_code
  ) AS images`
        )
      )
      .leftJoin(
        "hotel_contact_details as hcd",
        "h.hotel_code",
        "hcd.hotel_code"
      )
      .where(function () {
        if (id) {
          this.andWhere("h.id", id);
        }
        if (hotel_code) {
          this.andWhere("h.hotel_code", hotel_code);
        }
        if (email) {
          this.andWhere("hcd.email", email);
        }
      })
      .first();
  }

  // update hotel
  public async updateHotel(
    payload: any,
    where: { id?: number; email?: string }
  ) {
    const { email, id } = where;

    console.log({ payload, id });

    const res = await this.db("hotels as h")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where(function () {
        if (id) {
          this.where({ id });
        } else if (email) {
          this.where({ email });
        }
      });

    return res;
  }

  // delete hotel images
  public async deleteHotelImage(payload: number[], hotel_code: number) {
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

  // Get Hotel Account config
  public async getHotelAccConfig(
    hotel_code: number,
    configs: IAccountConfigHeads[]
  ): Promise<
    { id: number; hotel_code: number; config: string; head_id: number }[]
  > {
    return await this.db("acc_head_config")
      .withSchema(this.ACC_SCHEMA)
      .select("*")
      .andWhere("hotel_code", hotel_code)
      .whereIn("config", configs);
  }

  public async insertHotelAccConfig(payload: {
    hotel_code: number;
    config: string;
    head_id: number;
  }) {
    return await this.db("acc_head_config")
      .withSchema(this.ACC_SCHEMA)
      .insert(payload, "id");
  }
}

export default HotelModel;
