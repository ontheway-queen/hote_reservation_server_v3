import { IcreateRolePermission } from "../../appAdmin/utlis/interfaces/admin.role-permission.interface";
import { IUpdateAdminUserPayload } from "../../appM360/utlis/interfaces/mUserAdmin.interfaces";
import {
  ICreateUserAdminPayload,
  IUpdateAdminPayload,
} from "../../auth/utils/interfaces/hotel-admin.auth.types";
import { TDB } from "../../common/types/commontypes";

import Schema from "../../utils/miscellaneous/schema";

class RAdministrationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // create module
  public async rolePermissionGroup(body: any) {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(body);
  }

  // get permission group
  public async getRolePermissionGroup() {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name");
  }

  // create permission
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
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(insertObj);
  }

  // create hotel permission
  public async addedHotelPermission(
    payload: {
      hotel_code: number;
      permission_id: number;
    }[]
  ) {
    return await this.db("hotel_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // get all hotel permission
  public async getAllHotelPermission(payload: {
    ids?: number[];
    hotel_code?: number;
  }) {
    const { hotel_code, ids } = payload;
    console.log({ ids, hotel_code });

    return await this.db("hotel_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "hotel_code", "permission_id")
      .where(function () {
        if (ids?.length) {
          this.whereIn("id", ids);
        }
        if (hotel_code) {
          this.where({ hotel_code });
        }
      });
  }

  // v2 get all hotel permission code
  public async getAllHotelPermissions(payload: { hotel_code?: number }) {
    const { hotel_code } = payload;
    return await this.db("hotel_permission_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("hotel_code", "permissions")
      .where(function () {
        if (hotel_code) {
          this.where({ hotel_code });
        }
      });
  }

  // create role permission
  public async createRolePermission(insertObj: IcreateRolePermission[]) {
    return await this.db("role_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(insertObj);
  }

  // delete role perimission
  public async deleteRolePermission(
    h_permission_id: number,
    permission_type: string,
    role_id: number
  ) {
    const res = await this.db("role_permission")
      .withSchema(this.RESERVATION_SCHEMA)
      .andWhere("h_permission_id", h_permission_id)
      .andWhere("permission_type", permission_type)
      .andWhere("role_id", role_id)
      .delete();

    return res;
  }

  // create role
  public async createRole(payload: { hotel_code: number; name: string }) {
    return await this.db("roles")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // get role
  public async getAllRole(hotel_code: number) {
    return await this.db("role")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ hotel_code });
  }

  // get single role
  public async getSingleRole(id: number, hotel_code: number) {
    const res = await this.db("role_permission_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where("role_id", id)
      .andWhere({ hotel_code });

    return res;
  }

  // update role
  public async updateSingleRole(id: number, body: any, hotel_code: number) {
    const res = await this.db("role AS r")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(body)
      .where({ id })
      .andWhere({ hotel_code });

    return res;
  }

  // get role by name
  public async getRoleByName(name: string, hotel_code: number) {
    const res = await this.db("role")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where({ hotel_code })
      .andWhere(function () {
        if (name) {
          this.where("name", "like", `${name}%`);
        }
      });

    return res;
  }

  // get admins role permission
  public async getAdminRolePermission(payload: {
    email?: string;
    id?: Number;
  }) {
    const { id, email } = payload;

    console.log({ id });
    return await this.db("admin_permissions")
      .withSchema(this.RESERVATION_SCHEMA)
      .where(function () {
        if (id) {
          this.where({ id });
        } else {
          this.where({ email });
        }
      });
  }

  // insert user admin
  public async insertUserAdmin(payload: ICreateUserAdminPayload) {
    return await this.db("user_admin")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getSingleAdmin(where: { email?: string; id?: number }) {
    const { email, id } = where;
    return await this.db("user_admin AS ua")
      .select(
        "ua.id",
        "ua.email",
        "ua.hotel_code",
        "ua.phone",
        "ua.password",
        "ua.photo",
        "ua.name",
        "ua.status",
        "r.id As role_id",
        "r.name As role_name",
        "ua.created_at"
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .join("hotels as h", "ua.hotel_code", "h.hotel_code")
      .join("roles AS r", "ua.role", "r.id")
      .where(function () {
        if (id) {
          this.where("ua.id", id);
        }
        if (email) {
          this.where("ua.email", email);
        }
      });
  }

  // get admin by email
  public async getAdminByEmail(email: string) {
    return await this.db("user_admin AS ua")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.password",
        "ua.name",
        "ua.avatar",
        "ua.phone",
        "ua.status",
        "r.id As roleId",
        "r.name As roleName",
        "ua.created_at"
      )
      .leftJoin("role AS r", "ua.role", "r.id")
      .where({ email });
  }

  // get all admin
  public async getAllAdmin(payload: {
    hotel_code: number;
    limit: string;
    skip: string;
    status?: string;
  }) {
    const { limit, skip, status, hotel_code } = payload;
    const dtbs = this.db("user_admin AS ua");
    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.name",
        "ua.avatar",
        "ua.phone",
        "ua.status",
        "r.id As role_id",
        "r.name As role_name",
        "ua.created_at"
      )
      .leftJoin("role AS r", "ua.role", "r.id")
      .where(function () {
        if (status) {
          this.where("ua.status", status);
        }
        this.andWhere("ua.hotel_code", hotel_code);
      });

    const total = await this.db("user_admin AS ua")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("ua.id As total")
      .leftJoin("role AS r", "ua.role", "r.id")
      .where(function () {
        if (status) {
          this.where("ua.status", status);
        }
        this.andWhere("ua.hotel_code", hotel_code);
      });

    return { data, total: total[0].total };
  }

  // update admin model
  public async updateAdmin(
    payload: IUpdateAdminPayload,
    where: { email?: string; id?: number }
  ) {
    const { email, id } = where;
    return await this.db("user_admin")
      .withSchema(this.RESERVATION_SCHEMA)
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
  // get admin by id
  public async getAdminById(id: number) {
    return await this.db("user_admin AS ua")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.password",
        "ua.name",
        "ua.avatar",
        "ua.phone",
        "ua.status",
        "r.id As roleId",
        "r.name As roleName",
        "ua.created_at"
      )
      .leftJoin("role AS r", "ua.role", "r.id")
      .where("ua.id", id);
  }
}
export default RAdministrationModel;
