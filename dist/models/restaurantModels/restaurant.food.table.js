"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class RestaurantFoodModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createFood(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("foods")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertFoodIngredients(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("food_ingredients")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getFoods(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
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
            const data = yield baseQuery
                .clone()
                .select("f.id", "f.hotel_code", "f.restaurant_id", "f.photo", "f.name", "mc.name as menu_category_name", "ua.id as created_by_id", "u.name as unit_name", "u.short_code as unit_short_code", "ua.name as created_by_name", "f.status", "f.retail_price", "f.is_deleted")
                .orderBy("f.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            const countResult = yield baseQuery
                .clone()
                .count("f.id as total");
            const total = Number(countResult[0].total);
            return { total, data };
        });
    }
    getFood(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("foods as f")
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("f.id", "f.hotel_code", "f.restaurant_id", "f.photo", "f.name", "f.menu_category_id", "mc.name as menu_category_name", "f.unit_id", "u.name as unit_name", "u.short_code as unit_short_code", "f.retail_price", this.db.raw(`json_agg(
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
		) FILTER (WHERE fi.id IS NOT NULL AND fi.is_deleted = false) as ingredients`))
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
        });
    }
    updateFood({ where: { id }, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("foods as f")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload, "id")
                .where("f.id", id)
                .andWhere("f.is_deleted", false);
        });
    }
    deleteFood(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("foods")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("id", where.id);
        });
    }
    getFoodIngredients(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("food_ingredients")
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
        });
    }
    updateFoodIngredients({ where, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("food_ingredients")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload, "id")
                .where("product_id", where.product_id)
                .andWhere("food_id", where.food_id)
                .andWhere("is_deleted", false);
        });
    }
    deleteFoodIngredients(where) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(where);
            return yield this.db("food_ingredients")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("id", where.id)
                .andWhere("food_id", where.food_id)
                .andWhere("is_deleted", false);
        });
    }
}
exports.default = RestaurantFoodModel;
/*
[
  {
    id: number,
    quantity: number
  }
]
*/
//# sourceMappingURL=restaurant.food.table.js.map