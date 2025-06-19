import { IcreateRolePermission } from "../../../appAdmin/utlis/interfaces/admin.role-permission.interface";
import {
  ICreateUserAdminPayload,
  IUpdateAdminUserPayload,
} from "../../../appM360/utlis/interfaces/mUserAdmin.interfaces";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class MAdministrationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // create module
  public async rolePermissionGroup(body: any) {
    return await this.db("permission_group")
      .withSchema(this.M_SCHEMA)
      .insert(body);
  }

  // get permission group
  public async getRolePermissionGroup() {
    return await this.db("permission_group")
      .withSchema(this.M_SCHEMA)
      .select("id", "name");
  }

  // get all permission
  public async getAllPermission(payload: {
    ids?: number[];
    hotel_code?: number;
  }) {
    const { ids, hotel_code } = payload;
    const res = await this.db("permission AS p")
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
    return res;
  }

  // create role permission
  public async createRolePermission(insertObj: any[]) {
    const res = await this.db("role_permission")
      .withSchema(this.M_SCHEMA)
      .insert(insertObj);
    return res;
  }

  // delete role perimission
  public async deleteRolePermission(
    oldPermissionId: number,
    permissionType: string,
    role_id: number
  ) {
    const res = await this.db("role_permission")
      .withSchema(this.M_SCHEMA)
      .andWhere("permissionId", oldPermissionId)
      .andWhere("permissionType", permissionType)
      .andWhere("roleId", role_id)
      .delete();

    return res;
  }

  // create role
  public async createRole({ role_name }: { role_name: string }) {
    const res = await this.db("role")
      .withSchema(this.M_SCHEMA)
      .insert({ name: role_name });
    return res;
  }

  // create permission of role
  // public async createPermissionOfRole(permissionObj: any) {
  //   const res = await this.db("rolePermission")
  //     .withSchema(this.ADMINISTRATION_SCHEMA)
  //     .insert(permissionObj, "roleId");
  //   return res;
  // }

  // get role
  public async getRole() {
    const res = await this.db("role").withSchema(this.M_SCHEMA).select("*");

    return res;
  }

  // get single role
  public async getSingleRole(id: number) {
    const res = await this.db("role AS r")
      .withSchema(this.M_SCHEMA)
      .select(
        "r.id AS role_id",
        "r.name AS role_name",
        "pg.id AS permission_group_id",
        "pg.name AS permission_group_name",
        "p.id AS permission_id",
        "p.name AS permission_name",
        "rp.permission_type"
      )
      .join("role_permission AS rp", "r.id", "rp.role_id")
      .join("permission AS p", "rp.permission_id", "p.id")
      .join("permission_group AS pg", "p.permission_group_id", "pg.id")
      .where("r.id", id);

    return res;
  }

  // update role
  public async updateSingleRole(id: number, body: any) {
    const res = await this.db("role AS r")
      .withSchema(this.M_SCHEMA)
      .update(body)
      .where({ id });

    return res;
  }

  // get role by name
  public async getRoleByName(name: string) {
    const res = await this.db("role")
      .withSchema(this.M_SCHEMA)
      .select("*")
      .whereILike("name", `%${name}%`);

    return res;
  }

  // get admins role permission
  public async getAdminRolePermission(id: Number) {
    const res = await this.db("admin_permissions")
      .withSchema(this.M_SCHEMA)
      .where({ id });
    return res;
  }

  // insert user admin
  public async insertUserAdmin(payload: ICreateUserAdminPayload) {
    return await this.db("user_admin")
      .withSchema(this.M_SCHEMA)
      .insert(payload);
  }

  // get admin by email
  public async getSingleAdmin({ email, id }: { id?: number; email?: string }) {
    console.log({ id });
    return await this.db("user_admin AS ua")
      .withSchema(this.M_SCHEMA)
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
      .where(function () {
        if (id) {
          this.andWhere("ua.id", id);
        }
        if (email) {
          this.andWhere("ua.email", email);
        }
      });
  }

  // get admin by id

  // get all admin
  public async getAllAdmin(limit: string, skip: string, status: string) {
    const dtbs = this.db("user_admin AS ua");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.M_SCHEMA)
      .select(
        "ua.id",
        "ua.email",
        "ua.name",
        "ua.avatar",
        "ua.phone",
        "ua.status",
        "r.id As roleId",
        "r.name As roleName",
        "ua.created_at"
      )
      .leftJoin("role AS r", "ua.role", "r.id")
      .where(function () {
        if (status) {
          this.where({ status });
        }
      });

    const total = await this.db("user_admin AS ua")
      .count("ua.id As total")
      .withSchema(this.M_SCHEMA)
      .leftJoin("role AS r", "ua.role", "r.id")
      .where(function () {
        if (status) {
          this.where({ status });
        }
      });

    return { data, total: total[0].total };
  }

  // update admin model
  public async updateAdmin(
    payload: IUpdateAdminUserPayload,
    where: { email?: string; id?: number }
  ) {
    const { email, id } = where;
    return await this.db("user_admin")
      .withSchema(this.M_SCHEMA)
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
export default MAdministrationModel;
