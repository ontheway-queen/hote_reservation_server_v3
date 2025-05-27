import { IcreateRolePermission } from "../../appAdmin/utlis/interfaces/admin.role-permission.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HRolePermissionModel extends Schema {
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
}
export default HRolePermissionModel;
