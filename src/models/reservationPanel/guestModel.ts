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

  public async createGuest(payload: IguestInterface) {
    return await this.db("guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async createGuestForGroupBooking(payload: IguestInterface) {
    return await this.db("guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

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

  public async getAllGuest(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    phone?: string;
    email?: string;
    status?: string;
    hotel_code: number;
  }) {
    const { key, hotel_code, limit, skip, phone, email, status } = payload;

    const dtbs = this.db("guests as g");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "g.id",
        "g.first_name",
        "g.last_name",
        "g.email",
        "g.address",
        "g.phone",
        "c.country_name as country",
        "c.nationality",
        "g.is_active",
        "g.created_at"
      )
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .withSchema(this.RESERVATION_SCHEMA)
      .where("g.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("g.first_name", "like", `%${key}%`)
            .orWhere("g.email", "like", `%${key}%`)
            .orWhere("g.phone", "like", `%${key}%`);
        }

        if (phone) {
          this.andWhere("g.phone", "like", `%${phone}%`);
        }

        if (email) {
          this.andWhere("g.email", email);
        }
        if (status) {
          this.andWhere("g.is_active", status);
        }
      })
      .orderBy("g.id", "desc");

    const total = await this.db("guests as g")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("g.id as total")
      .where("g.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("g.first_name", "like", `%${key}%`)
            .orWhere("g.email", "like", `%${key}%`)
            .orWhere("g.phone", "like", `%${key}%`);
        }

        if (phone) {
          this.andWhere("g.phone", "like", `%${phone}%`);
        }

        if (email) {
          this.andWhere("g.email", email);
        }
        if (status) {
          this.andWhere("g.is_active", status);
        }
      });

    return { data, total: total[0].total };
  }

  public async getSingleGuest(where: {
    email?: string;
    phone?: string;
    user_type?: string;
    id?: number;
    hotel_code: number;
  }) {
    const { email, id, hotel_code } = where;
    return await this.db("guests")
      .select("*")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ hotel_code })
      .where(function () {
        if (id) {
          this.where("id", id);
        }
        if (email) {
          this.where("email", email);
        }
      });
  }

  public async updateSingleGuest(
    where: { id: number; hotel_code: number },
    payload: IUpdateUser
  ) {
    const { id, hotel_code } = where;
    return await this.db("guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async getSingleGuestLedeger({
    guest_id,
    hotel_code,
    from_date,
    to_date,
    limit,
    skip,
  }: {
    guest_id: number;
    hotel_code: number;
    from_date: string;
    to_date: string;
    limit: number;
    skip: number;
  }) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() + 1);
    const data = await this.db("guest_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "guest_id", "debit", "credit", "ledger_date", "remarks")
      .where({ guest_id })
      .andWhere({ hotel_code })
      .andWhere(function () {
        if (from_date && to_date) {
          this.whereBetween("ledger_date", [from_date, endDate]);
        }
      })
      .limit(limit ? limit : 50)
      .offset(skip ? skip : 0);

    const total = await this.db("guest_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where({ guest_id })
      .andWhere({ hotel_code })
      .andWhere(function () {
        if (from_date && to_date) {
          this.whereBetween("ledger_date", [from_date, endDate]);
        }
      });

    return {
      data,
      total: total[0].total,
    };
  }

  public async addGuestToRoom(
    payload: {
      booking_room_id: number;
      guest_id: number;
      is_room_primary_guest: boolean;
    }[]
  ) {
    return await this.db("booking_room_guests")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }
}
export default GuestModel;
