import IguestInterface, {
  IuserTypeInterface,
} from "../../appAdmin/utlis/interfaces/guest.interface";
import { IUpdateUser } from "../../appM360/utlis/interfaces/hotel-user.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class GuestModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Create Guest
  public async createGuest(payload: IguestInterface) {
    return await this.db("guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // get Guest user_type
  public async getGuest(payload: { user_type: string; email: string }) {
    const data = await this.db("user_view")
      .select("*")
      .withSchema(this.RESERVATION_SCHEMA)
      .orderBy("id", "desc");

    const total = await this.db("user_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total");

    return { data, total: total[0].total };
  }

  // Get User Type
  public async getAllUserType() {
    return await this.db("user_type")
      .select("*")
      .withSchema(this.RESERVATION_SCHEMA);
  }

  // get exists user_type
  public async getExistsUserType(user_id: number, user_type: string) {
    return await this.db("user_type")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({
        user_id: user_id,
        user_type: user_type,
      })
      .first();
  }

  // get Guest email
  public async getAllGuestEmail(payload: {
    email: string;
    hotel_code: number;
  }) {
    const { email, hotel_code } = payload;

    const dtbs = this.db("user");

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ "user.hotel_code": hotel_code })
      .andWhere({ "user.email": email })
      .orderBy("id", "desc");

    return { data };
  }

  // insert into guest ledger
  public async insertGuestLedger(payload: {
    guest_id: number;
    hotel_code: number;
    debit: number;
    credit: number;
    remarks?: string;
  }) {
    return await this.db("guest_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // get user ledeger last id
  public async getUserLedgerLastId(payload: {
    hotel_code: number;
    user_id: number;
  }) {
    const { hotel_code, user_id } = payload;
    return await this.db("user_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .where({ hotel_code })
      .andWhere({ user_id })
      .limit(1)
      .orderBy("id", "desc");
  }
  // Get All Guest Model
  public async getAllGuest(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    phone?: string;
    email?: string;
    hotel_code: number;
  }) {
    const { key, hotel_code, limit, skip, phone } = payload;

    const dtbs = this.db("guests");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "nationality",
        "is_active",
        "created_at"
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ hotel_code })
      .andWhere(function () {
        if (key) {
          this.andWhere("first_name", "like", `%${key}%`)
            .orWhere("email", "like", `%${key}%`)
            .orWhere("country", "like", `%${key}%`);
        }
      })
      .orderBy("id", "desc");

    const total = await this.db("guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where({ hotel_code })
      .andWhere(function () {
        if (key) {
          this.andWhere("first_name", "like", `%${key}%`)
            .orWhere("email", "like", `%${key}%`)
            .orWhere("country", "like", `%${key}%`);
        }
      });

    return { data, total: total[0].total };
  }

  // Get Guest single profile
  public async getSingleGuest(where: {
    email?: string;
    phone?: string;
    user_type?: string;
    id?: number;
    hotel_code?: number;
  }) {
    const { email, id, phone, hotel_code } = where;
    return await this.db("user_view as uv")
      .select(
        "uv.id",
        "uv.name",
        "uv.email",
        "uv.phone",
        "uv.country",
        "uv.city",
        "uv.status",
        "uv.last_balance",
        "uv.created_at",
        "uv.user_type"
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where(function () {
        if (id) {
          this.where("uv.id", id);
        }
        if (email) {
          this.where("uv.email", email);
        }
        if (phone) {
          this.where("uv.phone", phone);
        }
        if (hotel_code) {
          this.andWhere("uv.hotel_code", hotel_code);
        }
      });
  }

  //   update single guest
  public async updateSingleGuest(
    payload: { last_balance?: number },
    where: { hotel_code?: number; id?: number }
  ) {
    const { hotel_code, id } = where;
    return await this.db("user")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where({ hotel_code })
      .andWhere({ id });
  }
}
export default GuestModel;
