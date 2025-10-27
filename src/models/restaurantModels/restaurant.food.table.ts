import {
  IFoodPayload,
  IGetFoods,
  IGetSingleFood,
  StockItem,
} from "../../appRestaurantAdmin/utils/interface/food.interface";

import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantFoodModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createFood(payload: IFoodPayload) {
    return await this.db("foods")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async insertFoodIngredients(payload: any) {
    return await this.db("food_ingredients")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async insertInStocks(
    payload: {
      hotel_code: number;
      restaurant_id: number;
      food_id: number;
      quantity: number;
      received_quantity?: number;
      stock_date: string;
      created_by: number;
    }[]
  ) {
    return await this.db("stocks")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async insertInWastage(
    payload: {
      hotel_code: number;
      restaurant_id: number;
      food_id: number;
      quantity: number;
      wastage_date: string;
      created_by: number;
      remarks: string;
    }[]
  ) {
    return await this.db("wastage")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  public async getWastage({
    hotel_code,
    restaurant_id,
    limit,
    skip,
    from_date,
    to_date,
  }: {
    hotel_code: number;
    restaurant_id: number;
    limit?: number;
    skip?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<{
    data: {
      id: number;
      food_id: number;
      food_name: string;
      quantity: number;
      wastage_date: string;
      remarks: string;
      created_by: number;
    }[];
    total: number;
  }> {
    const data = await this.db("wastage as w")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "w.id",
        "w.food_id",
        "f.name as food_name",
        "w.quantity",
        this.db.raw("TO_CHAR(w.wastage_date,'YYYY-MM-DD') as wastage_date"),
        "w.remarks",
        "w.created_by",
        "ua.name as created_by_name"
      )
      .leftJoin("foods as f", "f.id", "w.food_id")
      .leftJoin("user_admin as ua", "ua.id", "w.created_by")
      .where("w.hotel_code", hotel_code)
      .andWhere("w.restaurant_id", restaurant_id)
      .andWhere((qb) => {
        if (from_date && to_date) {
          qb.andWhereBetween("w.wastage_date", [from_date, to_date]);
        }
      })
      .orderBy("w.id", "desc")
      .limit(limit ?? 100)
      .offset(skip ?? 0);

    const countResult = await this.db("wastage as w")
      .withSchema(this.RESTAURANT_SCHEMA)
      .where("w.hotel_code", hotel_code)
      .andWhere("w.restaurant_id", restaurant_id)
      .andWhere((qb) => {
        if (from_date && to_date) {
          qb.andWhereBetween("w.wastage_date", [from_date, to_date]);
        }
      })
      .count<{ total: string }[]>("w.id as total");

    const total = Number(countResult[0].total);

    return { data, total };
  }

  public async getStocks(where: {
    hotel_code: number;
    restaurant_id: number;
    stock_date?: string;
    id?: number;
  }): Promise<StockItem[]> {
    const { hotel_code, restaurant_id, stock_date, id } = where;

    // Subquery for stocks
    const stocksSubquery = this.db
      .select(
        "s.id",
        "s.food_id",
        "s.hotel_code",
        "s.restaurant_id",
        "s.quantity",
        "s.sold_quantity",
        "s.wastage_quantity",
        "s.transfered_quantity",
        "s.received_quantity",
        this.db.raw("TO_CHAR(s.stock_date, 'YYYY-MM-DD') as stock_date")
      )
      .from("hotel_restaurant.stocks as s")
      .where("s.hotel_code", hotel_code)
      .andWhere("s.restaurant_id", restaurant_id)
      .modify((qb) => {
        if (id) qb.andWhere("s.id", id);

        if (stock_date) {
          qb.andWhere("s.stock_date", stock_date);
        } else {
          qb.distinctOn(["s.food_id"])
            .orderBy("s.food_id")
            .orderBy("s.stock_date", "desc");
        }
      })
      .as("st");

    // Final main query
    const result = await this.db
      .select(
        "st.id as stock_id",
        "f.id as food_id",
        "f.name",
        "f.recipe_type",
        "f.photo",
        this.db.raw(
          "COALESCE(st.quantity + st.received_quantity, 0) AS quantity"
        ),
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN COALESCE(i.quantity, 0)
          ELSE COALESCE(
            COALESCE(st.quantity, 0)
            + COALESCE(st.received_quantity, 0)
            - (
              COALESCE(st.sold_quantity, 0)
              + COALESCE(st.wastage_quantity, 0)
              + COALESCE(st.transfered_quantity, 0)
            ),
            0
          )
        END AS available_stock
      `),
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN COALESCE(i.quantity_used, 0)
          ELSE COALESCE(st.sold_quantity, 0)
        END AS quantity_used
      `),
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN 0
          ELSE COALESCE(st.wastage_quantity, 0)
        END AS wastage_quantity
      `),
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN ''
          ELSE COALESCE(st.stock_date, '')
        END AS stock_date
      `),
        this.db.raw(
          `COALESCE(st.transfered_quantity, 0) AS transfered_quantity`
        ),
        this.db.raw(`COALESCE(st.received_quantity, 0) AS received_quantity`)
      )
      .from("hotel_restaurant.foods as f")
      .leftJoin("hotel_inventory.inventory as i", function () {
        this.on("i.product_id", "=", "f.linked_inventory_item_id")
          .andOn("i.hotel_code", "=", "f.hotel_code")
          .andOnVal("i.is_deleted", "=", false);
      })
      .leftJoin(stocksSubquery, function () {
        this.on("st.food_id", "=", "f.id")
          .andOn("st.hotel_code", "=", "f.hotel_code")
          .andOn("st.restaurant_id", "=", "f.restaurant_id");
      })
      .where("f.hotel_code", hotel_code)
      .andWhere("f.restaurant_id", restaurant_id)
      .andWhere("f.is_deleted", false)
      .whereIn("f.recipe_type", ["non-ingredients", "stock", "ingredient"]);

    return result;
  }

  public async updateStocks({
    where,
    payload,
  }: {
    where: { food_id?: number; stock_date?: string; id?: number };
    payload: {
      quantity?: number;
      sold_quantity?: number;
      wastage_quantity?: number;
      received_quantity?: number;
      transfered_quantity?: number;
    };
  }) {
    return await this.db("stocks")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload, "id")
      .where(function () {
        if (where.stock_date) this.andWhere("stock_date", where.stock_date);

        this.andWhere("is_deleted", false);

        if (where.id) this.andWhere("id", where.id);

        if (where.food_id) this.andWhere("food_id", where.food_id);
      });
  }

  public async getSingleStockWithFoodAndDate(where: {
    hotel_code: number;
    restaurant_id: number;
    food_id: number;
    stock_date: string;
  }): Promise<{
    id: number;
    hotel_code: number;
    restaurant_id: number;
    food_id: number;
    sold_quantity: number;
    wastage_quantity: number;
    received_quantity: number;
    quantity: number;
    stock_date: string;
    created_by: number;
  }> {
    return await this.db("stocks")
      .withSchema(this.RESTAURANT_SCHEMA)
      .where("food_id", where.food_id)
      .andWhere("stock_date", where.stock_date)
      .andWhere("is_deleted", false)
      .andWhere("hotel_code", where.hotel_code)
      .andWhere("restaurant_id", where.restaurant_id)
      .first();
  }

  public async getFoods(query: {
    hotel_code: number;
    restaurant_id: number;
    limit?: number;
    recipe_type?: "ingredients" | "non-ingredients" | "stock";
    skip?: number;
    id?: number;
    food_ids?: number[];
    name?: string;
    menu_category_id?: number;
    status?: "available" | "unavailable";
  }): Promise<{ data: IGetFoods[]; total: number }> {
    const baseQuery = this.db("foods as f")
      .withSchema(this.RESTAURANT_SCHEMA)
      .leftJoin("user_admin as ua", "ua.id", "f.created_by")
      .leftJoin("menu_categories as mc", "mc.id", "f.menu_category_id")
      .leftJoin("units as u", "u.id", "f.unit_id")
      .where("f.hotel_code", query.hotel_code)
      .andWhere("f.restaurant_id", query.restaurant_id)
      .andWhere("f.is_deleted", false);

    if (query.id) {
      baseQuery.andWhere("f.id", query.id);
    }
    if (query.name) {
      baseQuery.andWhereILike("f.name", `%${query.name}%`);
    }
    if (query.menu_category_id) {
      baseQuery.andWhere("f.menu_category_id", query.menu_category_id);
    }
    if (query.food_ids) {
      baseQuery.whereIn("f.id", query.food_ids);
    }

    if (query.status) {
      baseQuery.andWhere("f.status", query.status);
    }

    if (query.recipe_type) {
      baseQuery.andWhere("f.recipe_type", query.recipe_type);
    }
    const data = await baseQuery
      .clone()
      .select(
        "f.id",
        "f.hotel_code",
        "f.restaurant_id",
        "f.photo",
        "f.name",
        "mc.name as menu_category_name",
        "ua.id as created_by_id",
        "u.name as unit_name",
        "u.short_code as unit_short_code",
        "ua.name as created_by_name",
        "f.recipe_type",
        "f.status",
        "f.retail_price",
        "f.is_deleted"
      )
      .orderBy("f.id", "desc")
      .limit(query.limit ?? 100)
      .offset(query.skip ?? 0);

    const countResult = await baseQuery
      .clone()
      .count<{ total: string }[]>("f.id as total");

    const total = Number(countResult[0].total);

    return { total, data };
  }

  public async getFood(query: {
    id: number;
    hotel_code: number;
    restaurant_id: number;
  }): Promise<IGetSingleFood> {
    return await this.db("foods as f")
      .withSchema(this.RESTAURANT_SCHEMA)
      .select(
        "f.id",
        "f.hotel_code",
        "f.restaurant_id",
        "f.photo",
        "f.name",
        "f.menu_category_id",
        "mc.name as menu_category_name",
        "f.unit_id",
        "u.name as unit_name",
        "u.short_code as unit_short_code",
        "f.serving_quantity",
        "f.recipe_type",
        "f.retail_price",
        this.db.raw(`json_agg(
			json_build_object(
        'id', fi.id,
				'product_id', fi.product_id,
        'product_name', p.name,
        'product_code', p.product_code,
        'unit_id', p.unit_id,
        'unit_name', pu.name,
        'unit_short_code', pu.short_code,      
				'quantity_per_unit', fi.quantity_per_unit
			)
		) FILTER (WHERE fi.id IS NOT NULL AND fi.is_deleted = false) as ingredients`)
      )
      .leftJoin("menu_categories as mc", "mc.id", "f.menu_category_id")
      .leftJoin("units as u", "u.id", "f.unit_id")
      .leftJoin("food_ingredients as fi", "fi.food_id", "f.id")
      .joinRaw(`LEFT JOIN ?? AS p ON p.id = fi.product_id`, [
        `${this.HOTEL_INVENTORY_SCHEMA}.products`,
      ])
      .joinRaw(`LEFT JOIN ?? AS pu ON pu.id = p.unit_id`, [
        `${this.HOTEL_INVENTORY_SCHEMA}.units`,
      ])
      .where("f.hotel_code", query.hotel_code)
      .andWhere("f.restaurant_id", query.restaurant_id)
      .andWhere("f.id", query.id)
      .andWhere("f.is_deleted", false)
      .groupBy("f.id", "mc.name", "u.name", "u.short_code")
      .first();
  }
  public async updateFood({
    where: { id },
    payload,
  }: {
    where: { id: number };
    payload: Partial<IFoodPayload>;
  }) {
    return await this.db("foods as f")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload, "id")
      .where("f.id", id)
      .andWhere("f.is_deleted", false);
  }

  public async deleteFood(where: { id: number }) {
    return await this.db("foods")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update({ is_deleted: true })
      .where("id", where.id);
  }

  public async getFoodIngredients(where: {
    food_id: number;
    id?: number;
    product_id?: number;
  }): Promise<
    {
      id: number;
      food_id: number;
      product_id: number;
      quantity_per_unit: string;
    }[]
  > {
    return await this.db("food_ingredients")
      .withSchema(this.RESTAURANT_SCHEMA)
      .where("food_id", where.food_id)
      .andWhere((qb) => {
        if (where.id) {
          qb.where("id", where.id);
        }
        if (where.product_id) {
          qb.where("product_id", where.product_id);
        }
      })
      .andWhere("is_deleted", false);
  }

  public async updateFoodIngredients({
    where,
    payload,
  }: {
    where: { product_id: number; food_id: number };
    payload: { quantity_per_unit: number };
  }) {
    return await this.db("food_ingredients")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload, "id")
      .where("product_id", where.product_id)
      .andWhere("food_id", where.food_id)
      .andWhere("is_deleted", false);
  }

  public async deleteFoodIngredients(where: { id: number; food_id: number }) {
    console.log(where);
    return await this.db("food_ingredients")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update({ is_deleted: true })
      .where("id", where.id)
      .andWhere("food_id", where.food_id)
      .andWhere("is_deleted", false);
  }

  public async deleteFoodIngredientsByFood(where: {
    hotel_code: number;
    food_id: number;
  }) {
    return await this.db("food_ingredients")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update({ is_deleted: true })
      .where("food_id", where.food_id)
      .andWhere("is_deleted", false);
  }
}
export default RestaurantFoodModel;
