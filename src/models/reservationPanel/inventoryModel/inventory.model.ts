import {
  ICreateDemagedProductPayload,
  ICreateProductPayload,
  IGetProduct,
  IupdateProductPayload,
} from "../../../appInventory/utils/interfaces/product.interface";
import {
  ICreateStockInBody,
  ICreateStockItemBody,
  ICreateStockOutBody,
} from "../../../appInventory/utils/interfaces/stock.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class InventoryModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createProduct(payload: ICreateProductPayload) {
    return await this.db("products")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  public async getAllProduct(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    in_stock?: "0" | "1";
    hotel_code: number;
    pd_ids?: number[];
    unit?: string;
    category?: string;
    brand?: string;
  }): Promise<{ data: IGetProduct[]; total: number }> {
    const {
      limit,
      skip,
      key,
      in_stock,
      hotel_code,
      unit,
      category,
      brand,
      pd_ids,
    } = payload;

    const dtbs = this.db("products as p");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "p.id",
        "p.product_code",
        "p.name",
        "p.model",
        "p.category_id",
        "c.name as category",
        "p.unit_id",
        "u.name as unit",
        "p.brand_id",
        "b.name as brand",
        "i.available_quantity as in_stock",
        "p.status as status",
        "p.details",
        "p.image"
      )
      .where("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .leftJoin("categories as c", "p.category_id", "c.id")
      .leftJoin("inventory as i", "p.id", "i.product_id")
      .leftJoin("units as u", "p.unit_id", "u.id")
      .leftJoin("brands as b", "p.brand_id", "b.id")
      .andWhere(function () {
        if (key) {
          this.andWhere("p.name", "like", `%${key}%`).orWhere(
            "p.model",
            "like",
            `%${key}%`
          );
        }
        if (unit) {
          this.andWhere("u.name", "like", `%${unit}%`);
        }
        if (category) {
          this.andWhere("c.name", "like", `%${category}%`);
        }
        if (brand) {
          this.andWhere("b.name", "like", `%${brand}%`);
        }

        if (in_stock) {
          this.whereExists(function () {
            if (in_stock === "1")
              this.select("*")
                .from("hotel_inventory.inventory as i")
                .whereRaw("i.product_id = p.id")
                .andWhere("i.available_quantity", ">", 0);
            else if (in_stock === "0")
              this.select("*")

                .from("hotel_inventory.inventory as i")
                .whereRaw("i.product_id = p.id")
                .andWhere("i.available_quantity", "<=", 0);
          });
        }

        if (pd_ids) {
          this.whereIn("p.id", pd_ids);
        }
      })
      .orderBy("p.id", "desc");

    const total = await this.db("products as p")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("p.id as total")
      .where("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .leftJoin("categories as c", "p.category_id", "c.id")
      .leftJoin("inventory as i", "p.id", "i.product_id")
      .leftJoin("units as u", "p.unit_id", "u.id")
      .leftJoin("brands as b", "p.brand_id", "b.id")
      .andWhere(function () {
        if (key) {
          this.andWhere("p.name", "like", `%${key}%`).orWhere(
            "p.model",
            "like",
            `%${key}%`
          );
        }
        if (unit) {
          this.andWhere("u.name", "like", `%${unit}%`);
        }
        if (category) {
          this.andWhere("c.name", "like", `%${category}%`);
        }
        if (brand) {
          this.andWhere("b.name", "like", `%${brand}%`);
        }
        if (in_stock) {
          this.whereExists(function () {
            if (in_stock === "1")
              this.select("*")
                .from("hotel_inventory.inventory as i")
                .whereRaw("i.product_id = p.id")
                .andWhere("i.available_quantity", ">", 0);
            else if (in_stock === "0")
              this.select("*")

                .from("hotel_inventory.inventory as i")
                .whereRaw("i.product_id = p.id")
                .andWhere("i.available_quantity", "<=", 0);
          });
        }
        if (pd_ids) {
          this.whereIn("p.id", pd_ids);
        }
      });

    return { total: total[0].total as number, data };
  }

  public async getAllProductsForLastId() {
    return await this.db("products")
      .select("id")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .orderBy("id", "desc")
      .limit(1);
  }

  public async updateProduct(id: number, payload: IupdateProductPayload) {
    return await this.db("products")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async createDamagedProduct(payload: ICreateDemagedProductPayload[]) {
    return await this.db("damaged_products")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  public async getAllDamagedProduct(params: {
    key?: string;
    limit?: number;
    skip?: number;
    hotel_code: number;
    date_from?: string;
    date_to?: string;
  }) {
    const {
      hotel_code,
      key,
      limit = 10,
      skip = 0,
      date_from,
      date_to,
    } = params;
    console.log("date_from:", date_from);
    console.log("date_to:", date_to);
    const query = this.db("damaged_products as dm")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "dm.id",
        "dm.hotel_code",
        "dm.product_id",
        "pv.name",
        "pv.model",
        "pv.product_code",
        "u.name as unit_name",
        "b.name as brand_name",
        "dm.quantity",
        "dm.note",
        "dm.created_at",
        "ua.name as inserted_by"
      )
      .leftJoin("products as pv", "dm.product_id", "pv.id")
      .leftJoin("units as u", "u.id", "pv.unit_id")
      .leftJoin("brands as b", "b.id", "pv.brand_id")
      .joinRaw(`LEFT JOIN ?? as ua ON ua.id = dm.created_by`, [
        `${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
      ])
      .where("dm.hotel_code", hotel_code);

    if (key) {
      query.andWhere((qb) => {
        qb.whereILike("pv.name", `%${key}%`)
          .orWhereILike("pv.model", `%${key}%`)
          .orWhereILike("pv.product_code", `%${key}%`)
          .orWhereILike("b.name", `%${key}%`);
      });
    }
    if (date_from) query.andWhereRaw("DATE(dm.created_at) >= ?", [date_from]);
    if (date_to) query.andWhereRaw("DATE(dm.created_at) <= ?", [date_to]);

    const totalResult = await query
      .clone()
      .clearSelect()
      .count<{ count: string }[]>("* as count")
      .first();

    const total = Number(totalResult?.count || 0);

    const data = await query
      .orderBy("dm.created_at", "desc")
      .limit(limit)
      .offset(skip);

    return {
      total,
      data,
    };
  }

  // get single Damaged Product
  public async getSingleDamagedProduct(id: number, hotel_code: number) {
    return await this.db("damaged_product_view as dv")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("dv.*")
      .where("dv.id", id)
      .andWhere("dv.hotel_code", hotel_code);
  }

  // public async getInventoryDetails(payload: {
  //   limit?: number;
  //   skip?: number;
  //   key?: string;
  //   hotel_code: number;
  // }): Promise<{
  //   data: {
  //     id: number;
  //     product_code: string;
  //     product_name: string;
  //     category: string;
  //     available_quantity: number;
  //     quantity_used: number;
  //     total_damaged: number;
  //   }[];
  //   total: number;
  // }> {
  //   const { limit, skip, key, hotel_code } = payload;

  //   const baseQuery = this.db("inventory as i")
  //     .withSchema(this.HOTEL_INVENTORY_SCHEMA)
  //     .leftJoin("products as p", "p.id", "i.product_id")
  //     .leftJoin("categories as c", "c.id", "p.category_id")
  //     .where("i.hotel_code", hotel_code)
  //     .modify((qb) => {
  //       if (key) {
  //         qb.andWhere("p.name", "ilike", `%${key}%`);
  //       }
  //     });

  //   // get total count
  //   const totalResult = await baseQuery
  //     .clone()
  //     .count<{ count: string }>("i.id as count")
  //     .first();
  //   const total = totalResult ? parseInt(totalResult.count, 10) : 0;

  //   // get paginated data
  //   if (limit) baseQuery.limit(limit);
  //   if (skip) baseQuery.offset(skip);

  //   const data = await baseQuery
  //     .select(
  //       "i.id",
  //       "p.product_code",
  //       "p.name as product_name",
  //       "c.name as category",
  //       "i.available_quantity",
  //       "i.quantity_used",
  //       "i.total_damaged"
  //     )
  //     .orderBy("i.id", "desc");

  //   return { total, data };
  // }

  public async getInventoryDetails(payload: {
    limit?: number;
    skip?: number;
    key?: string;
    hotel_code: number;
  }): Promise<{
    data: {
      id: number;
      product_id: number;
      product_code: string;
      product_name: string;
      category: string;
      available_quantity: number;
      quantity_used: number;
      total_damaged: number;
    }[];
    total: number;
  }> {
    const { limit, skip, key, hotel_code } = payload;

    // --- data query ---
    const dataQuery = this.db("products as p")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "i.id",
        "p.id as product_id",
        "p.product_code",
        "p.name as product_name",
        "c.name as category",
        this.db.raw(
          "COALESCE(i.available_quantity, 0) - COALESCE(i.quantity_used, 0)-COALESCE(i.total_damaged, 0) as available_quantity"
        ),
        this.db.raw("COALESCE(i.quantity_used, 0) as quantity_used"),
        this.db.raw("COALESCE(i.total_damaged, 0) as total_damaged")
      )
      .leftJoin("categories as c", "c.id", "p.category_id")
      .leftJoin("inventory as i", function () {
        this.on("i.product_id", "p.id").andOnVal("i.hotel_code", hotel_code);
      })
      .andWhere("p.hotel_code", hotel_code)
      .modify((qb) => {
        if (key) {
          qb.andWhere("p.name", "ilike", `%${key}%`);
        }
        if (limit) qb.limit(limit);
        if (skip) qb.offset(skip);
      })
      .orderBy("p.id", "desc");

    const data = await dataQuery;

    // --- total query ---
    const totalQuery = await this.db("products as p")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count<{ total: string }>("p.id as total")
      .leftJoin("categories as c", "c.id", "p.category_id")
      .leftJoin("inventory as i", function () {
        this.on("i.product_id", "p.id").andOnVal("i.hotel_code", hotel_code);
      })
      .andWhere("p.hotel_code", hotel_code)
      .modify((qb) => {
        if (key) {
          qb.andWhere("p.name", "ilike", `%${key}%`);
        }
      });

    const total = Number(totalQuery[0]?.total | 0);

    return { total, data };
  }

  public async getSingleInventoryDetails(payload: {
    hotel_code: number;
    id?: number;
    product_id?: number;
  }): Promise<{
    id: number;
    hotel_code: number;
    product_id: number;
    product_code: string;
    product_model: string;
    product_name: string;
    product_details: string;
    product_image: string;
    product_status: string;
    category_id: number;
    category: string;
    unit_id: number;
    unit: string;
    brand_id: number;
    brand: string;
    available_quantity: number;
    quantity_used: number;
    total_damaged: number;
  }> {
    const { hotel_code, id } = payload;
    return await this.db("inventory as i")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "i.id",
        "i.hotel_code",
        "i.product_id",
        "p.product_code",
        "p.model as product_model",
        "p.name as product_name",
        "p.details as product_details",
        "p.image as product_image",
        "p.status as product_status",
        "p.category_id",
        "c.name as category",
        "p.unit_id",
        "u.name as unit",
        "p.brand_id",
        "b.name as brand",
        "i.available_quantity",
        "i.quantity_used",
        "i.total_damaged"
      )
      .leftJoin("products as p", "p.id", "i.product_id")
      .leftJoin("categories as c", "c.id", "p.category_id")
      .leftJoin("units as u", "u.id", "p.unit_id")
      .leftJoin("brands as b", "b.id", "p.brand_id")
      .where("i.hotel_code", hotel_code)
      .modify((qb) => {
        if (id) {
          qb.andWhere("i.id", id);
        }
        if (payload.product_id) {
          qb.andWhere("i.product_id", payload.product_id);
        }
      })
      .first();
  }

  // create stock
  public async createStockIn(payload: ICreateStockInBody) {
    return await this.db("stocks")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload, "id");
  }

  public async createStockOut(payload: ICreateStockOutBody) {
    return await this.db("stocks")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload, "id");
  }

  // Get All stock
  public async getAllStock(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    status?: string;
    hotel_code: number;
  }) {
    const { limit, skip, hotel_code, key, status } = payload;

    const dtbs = this.db("stock_view as sv");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "sv.stock_id",
        "sv.created_at as date",
        "acc.name as account_name",
        "acc.acc_type as account_type",
        "sv.status",
        "sv.paid_amount",
        "sv.note"
      )
      .where("sv.hotel_code", hotel_code)
      .joinRaw(`LEFT JOIN ?? as acc ON acc.id = sv.ac_tr_ac_id`, [
        `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
      ])
      .andWhere(function () {
        if (key) {
          this.andWhere("acc.name", "like", `%${key}%`);
        }
        if (status) {
          this.andWhere("sv.status", "like", `%${status}%`);
        }
      })
      .orderBy("sv.stock_id", "desc");

    const total = await this.db("stock_view as sv")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("sv.stock_id as total")
      .where("sv.hotel_code", hotel_code)
      .joinRaw(`LEFT JOIN ?? as acc ON acc.id = sv.ac_tr_ac_id`, [
        `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
      ])
      .andWhere(function () {
        if (key) {
          this.andWhere("acc.name", "like", `%${key}%`);
        }
        if (status) {
          this.andWhere("sv.status", "like", `%${status}%`);
        }
      });
    return { total: total[0].total, data };
  }

  // get single stock
  public async getSingleStock(id: number, hotel_code: number) {
    return await this.db("stock_view as sv")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("sv.*")
      .where("sv.stock_id", id)
      .andWhere("sv.hotel_code", hotel_code)
      .first();
  }

  // update stock
  public async updateStockItems(
    payload: { quantity: number },
    where: { id: number }
  ) {
    return await this.db("stock_items")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  // create stock item
  public async createStockItem(payload: ICreateStockItemBody[]) {
    return await this.db("stock_items")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // insert in inventory
  public async insertInInventory(
    payload: {
      hotel_code: number;
      product_id: number;
      available_quantity: number;
      quantity_used?: number;
    }[]
  ) {
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // update in inventory
  public async updateInInventory(
    payload: {
      available_quantity?: number;
      quantity_used?: number;
    },
    where: { id?: number; product_id?: number }
  ) {
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .update(payload)
      .modify((qb) => {
        if (where.product_id) {
          qb.where("product_id", where.product_id);
        }
        if (where.id) {
          qb.where("id", where.id);
        }
      });
  }

  // get all inventory
  public async getAllInventory(where: {
    hotel_code: number;
    product_id: number[];
  }) {
    const { product_id, hotel_code } = where;
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (product_id) {
          this.whereIn("product_id", product_id);
        }
      });
  }

  // get all purchase ingredient item
  public async getInventoryList(payload: {
    key: string;
    hotel_code: number;
    limit: string;
    skip: string;
  }) {
    const { limit, skip, hotel_code, key } = payload;

    const dtbs = this.db("inventory as inv");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "inv.id",
        "inv.product_id",
        "ing.name",
        "ing.measurement",
        "inv.available_quantity",
        "inv.quantity_used"
      )
      .leftJoin("ingredient as ing", "inv.product_id", "ing.id")
      .where({ "inv.hotel_code": hotel_code })
      .andWhere(function () {
        if (key) {
          this.andWhere((builder) => {
            builder.where("ing.name", "like", `%${key}%`);
          });
        }
      });
    return { data };
  }
}
export default InventoryModel;
