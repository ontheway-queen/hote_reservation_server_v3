import {
  IFoodPayload,
  IGetFoods,
  IGetSingleFood,
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
      stock_date: string;
      created_by: number;
    }[]
  ) {
    return await this.db("stocks")
      .withSchema(this.RESTAURANT_SCHEMA)
      .insert(payload, "id");
  }

  // public async getStocks(where: {
  //   hotel_code: number;
  //   restaurant_id: number;
  //   stock_date?: string; // optional
  // }) {
  //   const { hotel_code, restaurant_id, stock_date } = where;

  //   const dateCondition = stock_date
  //     ? `AND s.stock_date = '${stock_date}'`
  //     : "";

  //   return await this.db
  //     .select(
  //       "f.id as food_id",
  //       "f.name",
  //       "f.recipe_type",
  //       this.db.raw(`
  //       CASE
  //         WHEN f.recipe_type IN ('stock', 'ingredient') THEN
  //           COALESCE(
  //             (
  //               SELECT i.available_quantity
  //               FROM hotel_inventory.inventory i
  //               WHERE i.product_id = f.linked_inventory_item_id
  //                 AND i.hotel_code = f.hotel_code
  //                 AND i.is_deleted = false
  //               LIMIT 1
  //             ),
  //             0
  //           )
  //         ELSE
  //           COALESCE(
  //             (
  //               SELECT (s.quantity - s.sold_quantity)
  //               FROM hotel_restaurant.stocks s
  //               WHERE s.food_id = f.id
  //                 AND s.hotel_code = f.hotel_code
  //                 AND s.restaurant_id = f.restaurant_id
  //                 ${dateCondition}
  //               ORDER BY s.stock_date DESC
  //               LIMIT 1
  //             ),
  //             0
  //           )
  //       END AS available_stock
  //     `),
  //       this.db.raw(`
  //       CASE
  //         WHEN f.recipe_type IN ('stock', 'ingredient') THEN ''
  //         ELSE
  //           COALESCE(
  //             (
  //               SELECT TO_CHAR(s.stock_date, 'YYYY-MM-DD')
  //               FROM hotel_restaurant.stocks s
  //               WHERE s.food_id = f.id
  //                 AND s.hotel_code = f.hotel_code
  //                 AND s.restaurant_id = f.restaurant_id
  //                 ${dateCondition}
  //               ORDER BY s.stock_date DESC
  //               LIMIT 1
  //             ),
  //             ''
  //           )
  //       END AS stock_date
  //     `)
  //     )
  //     .from("hotel_restaurant.foods as f")
  //     .where("f.hotel_code", hotel_code)
  //     .andWhere("f.restaurant_id", restaurant_id)
  //     .andWhere("f.is_deleted", false);
  // }
  public async getStocks(where: {
    hotel_code: number;
    restaurant_id: number;
    stock_date?: string;
  }) {
    const { hotel_code, restaurant_id, stock_date } = where;

    const dateCondition = stock_date
      ? this.db.raw("AND s.stock_date = ?", [stock_date])
      : this.db.raw("");

    return await this.db
      .select(
        "f.id as food_id",
        "f.name",
        "f.recipe_type",
        "f.photo",

        // available_stock
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN
            COALESCE((
              SELECT i.quantity
              FROM hotel_inventory.inventory i
              WHERE i.product_id = f.linked_inventory_item_id
                AND i.hotel_code = f.hotel_code
                AND i.is_deleted = false
              LIMIT 1
            ), 0)
          ELSE
            COALESCE((
              SELECT (s.quantity - s.sold_quantity)
              FROM hotel_restaurant.stocks s
              WHERE s.food_id = f.id
                AND s.hotel_code = f.hotel_code
                AND s.restaurant_id = f.restaurant_id
                ${dateCondition}
              ORDER BY s.stock_date DESC
              LIMIT 1
            ), 0)
        END AS available_stock
      `),

        // quantity_used
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN
            COALESCE((
              SELECT i.quantity_used
              FROM hotel_inventory.inventory i
              WHERE i.product_id = f.linked_inventory_item_id
                AND i.hotel_code = f.hotel_code
                AND i.is_deleted = false
              LIMIT 1
            ), 0)
          ELSE
            COALESCE((
              SELECT s.sold_quantity
              FROM hotel_restaurant.stocks s
              WHERE s.food_id = f.id
                AND s.hotel_code = f.hotel_code
                AND s.restaurant_id = f.restaurant_id
                ${dateCondition}
              ORDER BY s.stock_date DESC
              LIMIT 1
            ), 0)
        END AS quantity_used
      `),

        // stock_date
        this.db.raw(`
        CASE 
          WHEN f.recipe_type IN ('stock', 'ingredient') THEN ''
          ELSE
            COALESCE((
              SELECT TO_CHAR(s.stock_date, 'YYYY-MM-DD')
              FROM hotel_restaurant.stocks s
              WHERE s.food_id = f.id
                AND s.hotel_code = f.hotel_code
                AND s.restaurant_id = f.restaurant_id
                ${dateCondition}
              ORDER BY s.stock_date DESC
              LIMIT 1
            ), '')
        END AS stock_date
      `)
      )
      .from("hotel_restaurant.foods as f")
      .where("f.hotel_code", hotel_code)
      .andWhere("f.restaurant_id", restaurant_id)
      .andWhere("f.is_deleted", false)
      .whereIn("f.recipe_type", ["non-ingredients", "stock"]);
  }

  public async updateStocks({
    where,
    payload,
  }: {
    where: { food_id: number; stock_date: string };
    payload: { quantity?: number; sold_quantity?: number };
  }) {
    return await this.db("stocks")
      .withSchema(this.RESTAURANT_SCHEMA)
      .update(payload, "id")
      .where("food_id", where.food_id)
      .andWhere("stock_date", where.stock_date)
      .andWhere("is_deleted", false);
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
