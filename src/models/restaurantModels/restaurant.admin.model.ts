import {
  IRestaurantUserAdminPayload,
  IUpdateRestaurantUserAdminPayload,
} from "../../appAdmin/utlis/interfaces/restaurant.hotel.interface";
import {
  IcreateRolePermission,
  IsingleRolePermission,
  IUserAdminWithHotel,
} from "../../appRestaurantAdmin/utils/interface/res.admin.interface";
import { IRestaurantAdminProfile } from "../../appRestaurantAdmin/utils/interface/restaurant.interface";
import {
  ICreateResAdminPayload,
  IUpdateResAdminPayload,
} from "../../auth/utils/interfaces/res_admin.auth.types";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HotelRestaurantAdminModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createRestaurantAdmin(payload: IRestaurantUserAdminPayload) {
    return await this.db("user_admin")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload);
  }

  public async getAllRestaurantAdminEmail(payload: {
    email: string;
    hotel_code: number;
  }) {
    const { email, hotel_code } = payload;

    const dtbs = this.db("user_admin as ua");

    const data = await dtbs
      .withSchema(this.RESTAURANT_SCHEMA)
      .where({ "ua.hotel_code": hotel_code })
      .andWhere({ "ua.email": email })
      .orderBy("id", "desc");

    return data.length > 0 ? data[0] : null;
  }

  public async getRestaurantAdmin(payload: { id?: number; email?: string }) {
    const { id, email } = payload;
    const dtbs = this.db("user_admin as ua");
    return await dtbs
      .withSchema(this.RESTAURANT_SCHEMA)
      .where(function () {
        if (id) {
          this.where({ "ua.id": id });
        }
        if (email) {
          this.where({ "ua.email": email });
        }
      })
      .first();
  }

  public async updateRestaurantAdmin({
    id,
    email,
    payload,
  }: {
    id?: number;
    email?: string;
    payload: IUpdateRestaurantUserAdminPayload;
  }) {
    return await this.db("user_admin")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload)
      .where(function () {
        if (id) {
          this.andWhere({ id });
        }
        if (email) {
          this.andWhere({ email });
        }
      });
  }

  public async getRestaurantAdminProfile(payload: {
    id: number;
    hotel_code: number;
    restaurant_id: number;
  }): Promise<IRestaurantAdminProfile> {
    const { id, hotel_code } = payload;
    const dtbs = this.db("user_admin as ua");
    return await dtbs
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "ua.id",
        "ua.name",
        "ua.email",
        "ua.phone",
        "ua.photo",
        "ua.status",
        "ua.role_id",
        "r.id as restaurant_id",
        "r.name as restaurant_name",
        "r.photo as restaurant_photo",
        "r.email as restaurant_email",
        "r.phone as restaurant_phone",
        "r.address as restaurant_address",
        "r.city as restaurant_city",
        "r.country as restaurant_country",
        "r.bin_no as restaurant_bin_no",
        "r.status as restaurant_status"
      )
      .leftJoin("restaurant as r", "r.id", "ua.restaurant_id")
      .where({ "ua.id": id, "ua.hotel_code": hotel_code })
      .first();
  }

  public async getHotelAllResPermissionByHotel({
    hotel_code,
    ids,
  }: {
    hotel_code: number;
    ids?: number[];
  }): Promise<{ id: number; hotel_code: number; permission_id: number }[]> {
    console.log(hotel_code, ids);

    return await this.db("restaurant_permission")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select("id", "hotel_code", "permission_id")
      .where({ hotel_code })
      .andWhere(function () {
        if (ids?.length) {
          this.whereIn("id", ids);
        }
      });
  }

  public async getResPermissionViewByHotel({
    hotel_code,
  }: {
    hotel_code: number;
  }): Promise<{
    hotel_code: number;
    permissions: {
      permission_id: number;
      permission_name: string;
      res_permission_id: number;
      permission_group_id: number;
      permission_group_name: string;
    }[];
  }> {
    return await this.db("restaurant_permission_view")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select("hotel_code", "permissions")
      .where({ hotel_code })
      .first();
  }

  public async updateRolePermission(
    payload: {
      write: number;
      update: number;
      delete: number;
      read: number;
      updated_by: number;
    },
    h_permission_id: number,
    role_id: number,
    hotel_code: number
  ) {
    return await this.db("role_permissions")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload)
      .where("role_id", role_id)
      .andWhere("h_permission_id", h_permission_id)
      .andWhere("hotel_code", hotel_code);
  }

  public async createPermission({
    permission_group_id,
    name,
    created_by,
    hotel_code,
  }: {
    permission_group_id: number;
    name: string[];
    created_by: number;
    hotel_code: number;
  }) {
    const insertObj = name.map((item: string) => {
      return {
        permission_group_id,
        name: item,
        created_by,
        hotel_code,
      };
    });

    return await this.db("permission")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(insertObj);
  }

  public async insertInRolePermission(insertObj: IcreateRolePermission[]) {
    return await this.db("role_permissions")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(insertObj);
  }

  public async getRolePermissionByRole({
    h_permission_ids,
    hotel_code,
    role_id,
  }: {
    hotel_code: number;
    h_permission_ids: number[];
    role_id: number;
  }) {
    return await this.db("role_permissions")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "res_permission_id",
        "role_id",
        "read",
        "write",
        "update",
        "delete"
      )
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (h_permission_ids?.length) {
          this.whereIn("res_permission_id", h_permission_ids);
        }
      })
      .andWhere("role_id", role_id);
  }

  public async deleteRolePermission(
    h_permission_id: number,
    permission_type: string,
    role_id: number
  ) {
    const res = await this.db("role_permission")
      .withSchema(this.RESTAURANT_SCHEMA)
      .andWhere("res_permission_id", h_permission_id)
      .andWhere("permission_type", permission_type)
      .andWhere("role_id", role_id)
      .delete();

    return res;
  }

  public async createRole(payload: {
    name: string;
    res_id: number;
    created_by?: number;
    hotel_code: number;
    init_role: boolean;
  }) {
    return await this.db("roles")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllRole({
    hotel_code,
    limit,
    skip,
    search,
  }: {
    limit: number;
    skip: number;
    hotel_code: number;
    search: string;
  }): Promise<{
    data: {
      role_id: number;
      role_name: number;
      created_by: string;
      created_at: string;
      init_role: boolean;
      status: boolean;
    }[];
    total: number;
  }> {
    const data = await this.db("roles as rl")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "rl.id as role_id",
        "rl.name as role_name",
        "ua.name as created_by",
        "rl.status",
        "rl.created_at",
        "rl.init_role"
      )
      .leftJoin("user_admin as ua", "ua.id", "rl.created_by")
      .where("rl.hotel_code", hotel_code)
      .andWhere(function () {
        if (search) {
          this.andWhere("rl.name", "ilike", `%${search}%`);
        }
      })
      .limit(limit ? limit : 100)
      .offset(skip ? skip : 0)
      .orderBy("rl.id", "asc");

    const count = await this.db("roles as rl")
      .withSchema(this.RESTAURANT_SCHEMA)
      .count("rl.id as total")
      .where("rl.hotel_code", hotel_code)
      .andWhere(function () {
        if (search) {
          this.andWhere("rl.name", "ilike", `%${search}%`);
        }
      });

    return { data, total: parseInt(count[0]?.total as string) | 0 };
  }

  public async getSingleRoleByView({
    id,
    hotel_code,
    role_name,
  }: {
    id?: number;
    hotel_code: number;
    role_name?: string;
  }): Promise<IsingleRolePermission> {
    return await this.db("role_permission_view")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select("*")
      .andWhere({ hotel_code })
      .andWhere(function () {
        if (role_name) {
          this.where("LOWER(role_name)", role_name.toLowerCase());
        }
        if (id) {
          this.where("role_id", id);
        }
      })
      .first();
  }

  public async updateSingleRole(id: number, body: any, hotel_code: number) {
    return await this.db("roles")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(body)
      .where({ id })
      .andWhere({ hotel_code });
  }

  public async getRoleByName(name: string, hotel_code: number) {
    return await this.db("roles")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select("*")
      .where({ hotel_code })
      .andWhere(function () {
        if (name) {
          this.whereRaw("LOWER(name) = ?", [name.toLowerCase()]);
        }
      });
  }

  public async createAdmin(payload: ICreateResAdminPayload) {
    return await this.db("user_admin")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  //get all admin
  public async getAllAdmin(filter: {
    search?: string;
    role_id?: number;
    limit?: number;
    skip?: number;
    hotel_code: number;
    status?: string;
    owner?: string;
  }) {
    const { limit, role_id, search, skip, status, hotel_code, owner } = filter;
    const data = await this.db("user_admin as ua")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "ua.id",
        "ua.name",
        "ua.email",
        "ua.phone",
        "ua.photo",
        "rl.name as role",
        "rl.id as role_id",
        "ua.status",
        "ua.owner"
      )
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .where((qb) => {
        if (search) {
          qb.where((qbc) => {
            qbc.where("ua.name", "ilike", `%${search}%`);
            qbc.orWhere("ua.email", "ilike", `%${search}%`);
          });
        }
        if (role_id) {
          qb.andWhere("rl.id", role_id);
        }

        qb.andWhere("ua.hotel_code", hotel_code);

        if (status) {
          qb.andWhere("ua.status", status);
        }
        if (owner) {
          qb.andWhere("ua.owner", owner);
        }
      })
      .orderBy("ua.name", "asc")
      .limit(limit || 100)
      .offset(skip || 0);

    let total: any[] = [];

    total = await this.db("user_admin as ua")
      .withSchema(this.RESTAURANT_SCHEMA)
      .count("ua.id as total")
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .where((qb) => {
        if (search) {
          qb.where((qbc) => {
            qbc.where("ua.name", "ilike", `%${search}%`);
            qbc.orWhere("ua.email", "ilike", `%${search}%`);
          });
        }
        if (role_id) {
          qb.andWhere("rl.id", role_id);
        }

        qb.andWhere("ua.hotel_code", hotel_code);

        if (status) {
          qb.andWhere("ua.status", status);
        }
        if (owner) {
          qb.andWhere("ua.owner", owner);
        }
      });

    return {
      data: data,
      total: total[0]?.total,
    };
  }

  public async getSingleAdmin(where: {
    email?: string;
    id?: number;
    owner?: string;
    hotel_code?: number;
  }): Promise<IUserAdminWithHotel> {
    const { email, id, hotel_code, owner } = where;
    return await this.db("user_admin AS ua")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.hotel_code",
        "h.name as hotel_name",
        "h.status as hotel_status",
        "ua.phone",
        "ua.password",
        "ua.photo",
        "ua.name",
        "ua.status",
        "r.id as role_id",
        "r.name as role_name",
        "ua.created_at",
        this.db.raw(`
		JSON_BUILD_OBJECT(
		  'phone', hcd.phone,
		  'fax', hcd.fax,
		  'address',h.address,
		  'website_url', hcd.website_url,
		  'optional_phone1',hcd.optional_phone1,
		  'email', hcd.email,
		  'logo',hcd.logo,
		  'bin',h.bin
		) as hotel_contact_details
	  `)
      )
      // .join("hotels as h", "ua.hotel_code", "h.hotel_code")
      .joinRaw(
        "JOIN hotel_reservation.hotels as h on ua.hotel_code = h.hotel_code"
      )
      // .leftJoin(
      //   "hotel_contact_details as hcd",
      //   "h.hotel_code",
      //   "hcd.hotel_code"
      // )
      .joinRaw(
        "JOIN hotel_reservation.hotel_contact_details as hcd on h.hotel_code = hcd.hotel_code"
      )

      .leftJoin("roles as r", "ua.role_id", "r.id")
      .modify(function (queryBuilder) {
        if (id) {
          queryBuilder.where("ua.id", id);
        }
        if (email) {
          queryBuilder.whereRaw("LOWER(ua.email) = ? ", [email.toLowerCase()]);
        }

        if (hotel_code) {
          queryBuilder.where("ua.hotel_code", hotel_code);
        }
        if (owner) {
          queryBuilder.where("ua.owner", owner);
        }
      })
      .first();
  }

  // update admin model
  public async updateAdmin(
    payload: IUpdateResAdminPayload,
    where: { email?: string; id?: number }
  ) {
    const { email, id } = where;
    return await this.db("user_admin")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload)
      .where(function () {
        if (email) {
          this.andWhere({ email });
        }
        if (id) {
          this.andWhere({ id });
        }
      });
  }

  // delete all permission
  public async deleteRolePermissionByRoleID({
    hotel_code,
    role_id,
  }: {
    hotel_code: number;
    role_id: number;
  }) {
    return await this.db("role_permissions")
      .withSchema(this.RESTAURANT_SCHEMA)
      .del()
      .where({ role_id })
      .andWhere({ hotel_code });
  }
}

export default HotelRestaurantAdminModel;
