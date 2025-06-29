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

  public async rolePermissionGroup(body: any) {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(body);
  }

  public async getRolePermissionGroup() {
    return await this.db("permission_group")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name");
  }

  public async updateRole(
    { name, status }: { name?: string; status?: number },
    id: number
  ) {
    return await this.db("roles")
      .withSchema(this.RESERVATION_SCHEMA)
      .update({ name, status })
      .where({ id });
  }

  // update role permission
  public async updateRolePermission(
    payload: {
      write: number;
      update: number;
      delete: number;
      read: number;
      updated_by: number;
    },
    permission_id: number,
    role_id: number
  ) {
    return await this.db("role_permissions")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("role_id", role_id)
      .andWhere("permission_id", permission_id);
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
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(insertObj);
  }

  public async permissionsList(params: {
    name?: string;
    limit?: number;
    skip?: number;
  }) {
    const data = await this.db("permissions as per")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "per.id as permission_id",
        "per.name as permission_name",
        "per.create_date"
      )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy("per.id", "asc")
      .where((qb) => {
        if (params.name) {
          qb.where("per.name", params.name);
        }
      });

    let count: any[] = [];

    count = await this.db("permissions")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .where((qb) => {
        if (params.name) {
          qb.where("name", params.name);
        }
      });

    return { data, total: count[0]?.total };
  }

  // create role permission
  public async createRolePermission(insertObj: IcreateRolePermission[]) {
    return await this.db("role_permissions")
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

  public async createRole(payload: {
    name: string;
    created_by?: number;
    hotel_code: number;
    init_role: boolean;
  }) {
    return await this.db("roles")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // get role
  public async roleList({
    hotel_code,
    limit,
    skip,
    search,
  }: {
    limit: number;
    skip: number;
    hotel_code: number;
    search: string;
  }) {
    const data = await this.db("roles as rl")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "rl.id as role_id",
        "rl.name as role_name",
        "ua.name as created_by",
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
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rl.id as total")
      .where("rl.hotel_code", hotel_code)
      .andWhere(function () {
        if (search) {
          this.andWhere("rl.name", "ilike", `%${search}%`);
        }
      });

    return { data, total: count[0]?.total };
  }

  // get single role
  public async getSingleRoleByView({
    id,
    hotel_code,
    role_name,
  }: {
    id?: number;
    hotel_code: number;
    role_name?: string;
  }) {
    const res = await this.db("role_permission_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .andWhere({ hotel_code })
      .andWhere(function () {
        if (role_name) {
          this.where("LOWER(role_name)", role_name.toLowerCase());
        }
        if (id) {
          this.where("role_id", id);
        }
      });

    return res;
  }
  // update role
  public async updateSingleRole(id: number, body: any, hotel_code: number) {
    const res = await this.db("roles")
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

  // insert user admin
  public async createAdmin(payload: ICreateUserAdminPayload) {
    return await this.db("user_admin")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getSingleAdmin(where: { email?: string; id?: number }) {
    const { email, id } = where;
    return await this.db("user_admin AS ua")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.hotel_code",
        "h.name as hotel_name",
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
          'email', hcd.email,
          'logo',hcd.logo
        ) as hotel_contact_details
      `)
      )
      .join("hotels as h", "ua.hotel_code", "h.hotel_code")
      .leftJoin(
        "hotel_contact_details as hcd",
        "h.hotel_code",
        "hcd.hotel_code"
      )
      .leftJoin("roles as r", "ua.role_id", "r.id")
      .modify(function (queryBuilder) {
        if (id) {
          queryBuilder.where("ua.id", id);
        }
        if (email) {
          queryBuilder.whereRaw("LOWER(ua.email) = ? ", [email.toLowerCase()]);
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

  //get all admin
  public async getAllAdmin(filter: {
    search?: string;
    role_id?: number;
    limit?: number;
    skip?: number;
    hotel_code: number;
    status?: string;
    owner?: boolean;
  }) {
    const { limit, role_id, search, skip, status, hotel_code, owner } = filter;
    const data = await this.db("user_admin as ua")
      .withSchema(this.RESERVATION_SCHEMA)
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
      .withSchema(this.RESERVATION_SCHEMA)
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
}
export default RAdministrationModel;
