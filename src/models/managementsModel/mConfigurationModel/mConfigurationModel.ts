import { ImUpdateRoomAmenitiesPayload } from "../../../appM360/utlis/interfaces/mHotel.common.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class MConfigurationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getAllAccomodation({ status }: { status?: string }) {
    return await this.db("accomodation_type")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where((query) => {
        if (status) {
          query.where("status", status);
        }
      });
  }

  public async getSingleAccomodation(id: number) {
    return await this.db("accomodation_type")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ id });
  }

  public async insertCity(body: {
    city_code: number;
    city_name: string;
    country_code: string;
  }) {
    return await this.db("city").withSchema(this.PUBLIC_SCHEMA).insert(body);
  }

  public async getAllCity({
    limit,
    skip,
    search,
    country_code,
  }: {
    limit?: number;
    skip?: number;
    search?: string;
    country_code?: string;
  }) {
    return await this.db("city")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("*")
      .where((query) => {
        if (search) {
          query.where("status", "ilike", `%${search}%`);
        }
        if (country_code) {
          query.where("country_code", country_code);
        }
      })
      .limit(limit || 30)
      .offset(skip || 0);
  }

  public async getLastCityCode() {
    const data = await this.db("city")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("city_code")
      .orderBy("city_code", "desc")
      .limit(1);

    return data.length ? data[0].city_code : 2025;
  }

  public async getAllCountry({
    limit,
    skip,
    search,
  }: {
    limit?: number;
    skip?: number;
    search?: string;
  }) {
    const dtbs = this.db("country");

    if (limit && skip) {
      dtbs.limit(limit);
      dtbs.offset(skip);
    }
    return await dtbs
      .withSchema(this.PUBLIC_SCHEMA)
      .select("*")
      .where((query) => {
        if (search) {
          query
            .where("country_code_2_letter", "ilike", `%${search}%`)
            .orWhere("country_name", "ilike", `${search}`);
        }
      });
  }

  //-------------------- permission ---------------- //

  public async createPermissionGroup(body: {
    name: string;
    created_by: number;
  }) {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(body);
  }

  public async getAllRolePermissionGroup(payload: {
    name?: string;
    id?: number;
  }) {
    const { id, name } = payload;

    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name")
      .where(function () {
        if (name) {
          this.where("name", "like", `%${name}%`);
        }

        if (id) {
          this.andWhere({ id });
        }
      });
  }

  public async getSinglePermissionGroup(id: number) {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ id });
  }

  public async createPermission(
    payload: {
      permission_group_id: number;
      name: string[];
      created_by: number;
    }[]
  ) {
    return await this.db("permissions")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // get all permission
  public async getAllPermissionByHotel(hotel_code: number): Promise<{
    hotel_id: number;
    hotel_code: string;
    name: string;
    permissions: {
      h_permission_id: number;
      permission_group_id: number;
      permission_group_name: string;
      permission_id: number;
      permission_name: string;
    }[];
  }> {
    return await this.db("hotel_permission_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ hotel_code })
      .first();
  }

  // get all permission
  public async getAllPermission(payload: { ids?: number[] }) {
    const { ids } = payload;
    return await this.db("permissions AS p")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "p.id AS permission_id",
        "p.name As permission_name",
        "p.permission_group_id",
        "pg.name AS permission_group_name"
      )
      .join("permission_group AS pg", "p.permission_group_id", "pg.id")
      .where(function () {
        if (ids?.length) {
          this.whereIn("p.id", ids);
        }
      });
  }

  // added hotel permission
  public async addedHotelPermission(
    payload: {
      hotel_code: number;
      permission_id: number;
    }[]
  ) {
    return await this.db("hotel_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // create hotel permission
  public async deleteHotelPermission(
    hotel_code: number,
    permission_id: number[]
  ) {
    return await this.db("hotel_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .whereIn("permission_id", permission_id)
      .andWhere({ hotel_code })
      .delete();
  }

  // delete hotel hotel role permission
  public async deleteHotelRolePermission(
    hotel_code: number,
    h_permission_id: number[]
  ) {
    return await this.db("role_permissions")
      .withSchema(this.RESERVATION_SCHEMA)
      .whereIn("h_permission_id", h_permission_id)
      .andWhere({ hotel_code })
      .delete();
  }

  public async createAmenitiesHead(payload: {
    name: string;
    order_number: number;
  }) {
    return await this.db("amenity_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getAllAmenitiesHead(payload: {
    limit?: string;
    skip?: string;
    status?: string;
    search?: string;
  }) {
    const { limit, skip, search, status } = payload;

    const dtbs = this.db("amenity_heads");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name", "status")
      .where(function () {
        if (search) {
          this.andWhere("name", "like", `%${search}%`);
        }
        if (status) {
          this.andWhere("status", status);
        }
      })
      .orderBy("id", "desc");

    return { data };
  }

  public async updateAmenitiesHead(
    id: number,
    payload: { name: string; status: number }
  ) {
    return await this.db("amenity_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async createAmenities(payload: {
    name: string;
    icon: string;
    head_id: number;
  }) {
    return await this.db("amenities")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getAllAmenities(payload: {
    limit?: string;
    skip?: string;
    status?: string;
    search?: string;
    hotel_code?: number;
    head_id?: number;
  }) {
    const { limit, skip, search, status, head_id } = payload;

    const dtbs = this.db("amenities");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name", "icon", "status")
      .where(function () {
        if (search) {
          this.andWhere("name", "like", `%${search}%`);
        }
        if (status) {
          this.andWhere("status", status);
        }
        if (head_id) {
          this.andWhere("head_id", head_id);
        }
      })
      .orderBy("id", "desc");

    const total = await this.db("amenities")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where(function () {
        if (search) {
          this.andWhere("name", "like", `%${search}%`);
        }
        if (status) {
          this.andWhere("status", status);
        }

        if (head_id) {
          this.andWhere("head_id", head_id);
        }
      });

    return { total: total[0].total, data };
  }

  public async updateAmenities(
    id: number,
    payload: ImUpdateRoomAmenitiesPayload
  ) {
    return await this.db("amenities")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async deleteAmenities(id: number) {
    return await this.db("hotel_room_amenities_head")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id })
      .del();
  }
}
export default MConfigurationModel;
