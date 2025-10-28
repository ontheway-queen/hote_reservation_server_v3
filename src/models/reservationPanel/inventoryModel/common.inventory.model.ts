import {
  ICreateCommonInvPayload,
  ICreateInvSupplierPayload,
  IGetCommonInv,
  IGetInvSupplier,
  IUpdateCommonInvPayload,
  IUpdateInvSupplierPayload,
} from "../../../appInventory/utils/interfaces/common.inv.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class CommonInventoryModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //=================== Category  ======================//

  // create Category
  public async createCategory(payload: ICreateCommonInvPayload) {
    return await this.db("categories")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Category
  public async getAllCategory(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
    id?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { id, limit, skip, name, status, hotel_code, excludeId } = payload;

    const dtbs = this.db("categories as c");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("c.id", "c.hotel_code", "c.name", "c.status", "c.is_deleted")
      .andWhere("c.is_deleted", false)
      .where(function () {
        this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (id) {
          this.andWhere("c.id", id);
        }
        if (name) {
          this.andWhere("c.name", "like", `%${name}%`);
        }
        if (status) {
          this.andWhere("c.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("c.id", "!=", excludeId);
        }
      })
      .orderBy("c.id", "desc");

    const total = await this.db("categories as c")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("c.id as total")
      .where(function () {
        this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (id) {
          this.andWhere("c.id", id);
        }
        if (name) {
          this.andWhere("c.name", "like", `%${name}%`);
        }
        if (status) {
          this.andWhere("c.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("c.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Category
  public async updateCategory(id: number, payload: IUpdateCommonInvPayload) {
    return await this.db("categories")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id })
      .update(payload);
  }

  //=================== Unit  ======================//

  // create Unit
  public async createUnit(payload: ICreateCommonInvPayload) {
    return await this.db("units")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Unit
  public async getAllUnit(payload: {
    limit?: string;
    skip?: string;
    key: string;
    short_code?: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { limit, skip, key, status, hotel_code, excludeId, short_code } =
      payload;

    const dtbs = this.db("units as u");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "u.id",
        "u.hotel_code",
        "u.name",
        "u.short_code",
        "u.status",
        "u.is_deleted"
      )
      .where(function () {
        this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
      })
      .andWhere("u.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.andWhere((qb) => {
            qb.where("u.name", "like", `%${key}%`).orWhere(
              "u.short_code",
              "like",
              `%${key}%`
            );
          });
        }

        // by lowercase and equal not like
        if (short_code) {
          this.whereRaw("LOWER(u.short_code) = ?", [short_code.toLowerCase()]);
        }

        if (status) {
          this.andWhere("u.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("u.id", "!=", excludeId);
        }
      })
      .orderBy("u.id", "desc");

    const total = await this.db("units as u")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("u.id as total")
      .where(function () {
        this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
      })
      .andWhere("u.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.andWhere((qb) => {
            qb.where("u.name", "like", `%${key}%`).orWhere(
              "u.short_code",
              "like",
              `%${key}%`
            );
          });
        }
        if (status) {
          this.andWhere("u.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("u.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Unit
  public async updateUnit(
    id: number,
    hotel_code: number,
    payload: IUpdateCommonInvPayload
  ) {
    return await this.db("units")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  //=================== Brand  ======================//

  // create Brand
  public async createBrand(payload: ICreateCommonInvPayload) {
    return await this.db("brands")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Brand
  public async getAllBrand(payload: {
    limit?: string;
    skip?: string;
    name: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { limit, skip, name, status, hotel_code, excludeId } = payload;

    const dtbs = this.db("brands as b");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("b.id", "b.hotel_code", "b.name", "b.status", "b.is_deleted")
      .andWhere("b.is_deleted", false)
      .where(function () {
        this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (name) {
          this.andWhere("b.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (excludeId) {
          this.andWhere("b.id", "!=", excludeId);
        }
      })
      .orderBy("b.id", "desc");

    const total = await this.db("brands as b")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("b.id as total")
      .andWhere("b.is_deleted", false)
      .where(function () {
        this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (name) {
          this.andWhere("b.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (excludeId) {
          this.andWhere("b.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Brand
  public async updateBrand(
    id: number,
    hotel_code: number,
    payload: IUpdateCommonInvPayload
  ) {
    return await this.db("brands")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }
}
export default CommonInventoryModel;
