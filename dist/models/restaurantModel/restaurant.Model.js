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
class RestaurantModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Restaurant  ======================//
    createRestaurant(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllRestaurant(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, limit, skip, hotel_code } = payload;
            const dtbs = this.db("restaurant as r");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("r.id", "r.name", "r.email", "r.status", "r.phone", "r.photo", "r.status", "r.is_deleted")
                .where("r.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("r.name", "ilike", `%${key}%`).orWhere("r.email", "ilike", `%${key}%`);
                }
            })
                .orderBy("r.id", "desc");
            const total = yield this.db("restaurant as r")
                .withSchema(this.RESTAURANT_SCHEMA)
                .count("r.id as total")
                .where("r.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("r.name", "ilike", `%${key}%`).orWhere("r.email", "ilike", `%${key}%`);
                }
            });
            return { total: parseInt(total[0].total), data };
        });
    }
    getRestaurantWithAdmin(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = where;
            return yield this.db("restaurant as r")
                .select("r.id", "r.photo", "r.name", "r.email", "r.phone", "r.address", "r.city", "r.country", "r.bin_no", "r.status", "r.is_deleted", "ua.id as admin_id", "ua.name as admin_name", "ua.photo as admin_photo", "ua.phone as admin_phone", "ua.email as admin_email", "ua.status as admin_status")
                .withSchema(this.RESTAURANT_SCHEMA)
                .leftJoin("user_admin as ua", "ua.restaurant_id", "r.id")
                .where("r.hotel_code", hotel_code)
                .andWhere("r.id", restaurant_id)
                .andWhere("r.is_deleted", false)
                .first();
        });
    }
    updateRestaurant({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant as r")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("r.id", id)
                .update(payload);
        });
    }
    //=================== Restaurant Tables  ======================//
    createTable(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant_tables")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getTables(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("restaurant_tables as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("rt.hotel_code", query.hotel_code)
                .andWhere("rt.restaurant_id", query.restaurant_id)
                .andWhere("rt.is_deleted", false);
            if (query.id) {
                baseQuery.andWhere("rt.id", query.id);
            }
            if (query.name) {
                baseQuery.andWhereILike("rt.name", `%${query.name}%`);
            }
            if (query.category) {
                baseQuery.andWhere("rt.category", query.category);
            }
            if (query.status) {
                baseQuery.andWhere("rt.status", query.status);
            }
            const data = yield baseQuery
                .clone()
                .select("rt.id", "rt.hotel_code", "rt.restaurant_id", "rt.name", "rt.category", "rt.status", "rt.is_deleted")
                .orderBy("rt.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            const countResult = yield baseQuery
                .clone()
                .count("rt.id as total");
            const total = Number(countResult[0].total);
            return { total, data };
        });
    }
    updateTable({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant_tables as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("rt.id", id)
                .update(payload);
        });
    }
    deleteTable(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant_tables as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("rt.id", where.id);
        });
    }
    // =================== Restaurant Menu Categories  ======================//
    createMenuCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("menu_categories")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getMenuCategories(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("menu_categories as mc")
                .withSchema(this.RESTAURANT_SCHEMA)
                .leftJoin("user_admin as ua", "ua.id", "mc.created_by")
                .where("mc.hotel_code", query.hotel_code)
                .andWhere("mc.restaurant_id", query.restaurant_id)
                .andWhere("mc.is_deleted", false);
            if (query.id) {
                baseQuery.andWhere("mc.id", query.id);
            }
            if (query.name) {
                baseQuery.andWhereILike("mc.name", `%${query.name}%`);
            }
            if (query.status) {
                baseQuery.andWhere("mc.status", query.status);
            }
            const [{ count }] = yield baseQuery
                .clone()
                .count("* as count");
            const data = yield baseQuery
                .clone()
                .select("mc.id", "mc.hotel_code", "mc.restaurant_id", "mc.name", "mc.status", "mc.is_deleted", "mc.created_by", "ua.name as created_by_name")
                .orderBy("mc.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            return {
                total: Number(count),
                data,
            };
        });
    }
    updateMenuCategory({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("menu_categories as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("rt.id", id)
                .andWhere("rt.is_deleted", false)
                .update(payload, "id");
        });
    }
    deleteMenuCategory(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("menu_categories as mc")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("mc.id", where.id);
        });
    }
    // =================== Unit  ======================//
    createUnit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("units")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getUnits(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("units as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("rt.hotel_code", query.hotel_code)
                .andWhere("rt.restaurant_id", query.restaurant_id)
                .andWhere("rt.is_deleted", false);
            if (query.id) {
                baseQuery.andWhere("rt.id", query.id);
            }
            if (query.name) {
                baseQuery.andWhereILike("rt.name", `%${query.name}%`);
            }
            const data = yield baseQuery
                .clone()
                .select("rt.id", "rt.hotel_code", "rt.restaurant_id", "rt.name", "rt.short_code", "rt.is_deleted")
                .orderBy("rt.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            const countResult = yield baseQuery
                .clone()
                .count("rt.id as total");
            const total = Number(countResult[0].total);
            return { total, data };
        });
    }
    updateUnit({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("units as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload, "id")
                .where("rt.id", id)
                .andWhere("rt.is_deleted", false);
        });
    }
    deleteUnit(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("units as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("rt.id", where.id)
                .andWhere("rt.is_deleted", false);
        });
    }
    // =================== Food  ======================//
    createFood(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("foods")
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
    // =================== Order  ======================//
    getLastOrder(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("orders")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("hotel_code", query.hotel_code)
                .andWhere("restaurant_id", query.restaurant_id)
                .orderBy("id", "desc")
                .first()
                .limit(1);
        });
    }
    createOrder(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("orders")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getOrders(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .leftJoin("user_admin as ua", "ua.id", "o.created_by")
                .leftJoin("restaurant_tables as rt", "rt.id", "o.table_id")
                .where("o.hotel_code", query.hotel_code)
                .andWhere("o.restaurant_id", query.restaurant_id)
                .andWhere("o.is_deleted", false)
                .andWhereNot("o.status", "canceled");
            if (query.table_id) {
                baseQuery.andWhere("o.table_id", query.table_id);
            }
            if (query.from_date) {
                baseQuery.andWhere("o.created_at", ">=", query.from_date);
            }
            if (query.to_date) {
                baseQuery.andWhere("o.created_at", "<=", query.to_date);
            }
            if (query.status) {
                baseQuery.andWhere("o.status", query.status);
            }
            if (query.order_type) {
                baseQuery.andWhere("o.order_type", query.order_type);
            }
            if (query.kitchen_status) {
                baseQuery.andWhere("o.kitchen_status", query.kitchen_status);
            }
            const data = yield baseQuery
                .clone()
                .select("o.id", "o.hotel_code", "o.restaurant_id", "o.table_id", "rt.name as table_name", "o.order_type", "o.status", "o.kitchen_status", "o.created_at", "o.total", "o.discount", "o.service_charge", "o.sub_total", "o.vat_amount", "o.grand_total", "ua.id as created_by_id", "ua.name as created_by_name")
                .orderBy("o.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            const countResult = yield baseQuery
                .clone()
                .count("o.id as total");
            const total = Number(countResult[0].total);
            return { total, data };
        });
    }
    getOrderById(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("o.id", "o.hotel_code", "o.restaurant_id", "o.table_id", "rt.name as table_name", "o.order_no", "o.staff_id", "eu.name as staff_name", "o.order_type", "o.status", "o.kitchen_status", "o.created_at", "o.total", "o.discount", "o.service_charge", "o.service_charge_type", "o.sub_total", "o.vat_rate", "o.vat_amount", "o.grand_total", "ua.id as created_by_id", "ua.name as created_by_name", this.db.raw(`
				COALESCE(
					json_agg(
						json_build_object(
							'id', oi.id,
							'food_id', f.id,
							'food_name', f.name,
							'quantity', oi.quantity,
							'rate', oi.rate,
							'total', oi.total
						)
					) FILTER (WHERE oi.id IS NOT NULL AND oi.is_deleted = false), '[]'
				) as order_items
			`))
                .leftJoin("user_admin as ua", "ua.id", "o.created_by")
                .joinRaw(`LEFT JOIN ?? as eu ON o.staff_id = eu.id`, [
                `${this.HR_SCHEMA}.${this.TABLES.employee}`,
            ])
                .leftJoin("restaurant_tables as rt", "rt.id", "o.table_id")
                .leftJoin("order_items as oi", "oi.order_id", "o.id")
                .leftJoin("foods as f", "f.id", "oi.food_id")
                .where(function () {
                if (where.id) {
                    this.andWhere("o.id", where.id);
                }
                if (where.table_id) {
                    this.andWhere("o.table_id", where.table_id);
                    this.andWhere("o.status", "confirmed");
                }
            })
                .andWhere("o.hotel_code", where.hotel_code)
                .andWhere("o.restaurant_id", where.restaurant_id)
                .groupBy("o.id", "ua.id", "rt.id", "eu.name")
                .first();
        });
    }
    updateOrder({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ id, payload });
            return yield this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("o.id", id)
                .update(payload, "id");
        });
    }
    cancelOrder(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("o.id", where.id)
                .update({ status: "canceled", kitchen_status: "canceled" });
        });
    }
    completeOrderPayment(where, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("o.id", where.id)
                .update(payload);
        });
    }
    getKitchenOrders(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, restaurant_id, hotel_code, order_no } = query;
            const data = yield this.db("orders as o")
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("o.id", "o.hotel_code", "o.restaurant_id", "o.order_no", "rt.name as table_name", "eu.name as staff_name", "o.room_no", "o.order_type", "o.kitchen_status", "o.created_at", this.db.raw(`(
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'food_name', f.name,
              'quantity', oi.quantity
            )
          ), '[]'
        )
        FROM hotel_restaurant.order_items as oi
        LEFT JOIN hotel_restaurant.foods as f ON f.id = oi.food_id
        WHERE oi.order_id = o.id AND oi.is_deleted = false
      ) as order_items`))
                .joinRaw(`LEFT JOIN ?? as eu ON o.staff_id = eu.id`, [
                `${this.HR_SCHEMA}.${this.TABLES.employee}`,
            ])
                .leftJoin("restaurant_tables as rt", "rt.id", "o.table_id")
                .where("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .modify((qb) => {
                if (order_no) {
                    qb.andWhereILike("o.order_no", `%${order_no}%`);
                }
            })
                .limit(limit || 100)
                .offset(skip)
                .orderBy("o.created_at", "desc");
            const total = data.length;
            return { total: Number(total), data };
        });
    }
    // =================== Order Items  ======================//
    createOrderItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("order_items")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    deleteOrderItems(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("order_items")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("order_id", where.order_id)
                .update({ is_deleted: true });
        });
    }
    updateOrderItems({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("order_items as oi")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("oi.id", id)
                .update(payload);
        });
    }
}
exports.default = RestaurantModel;
//# sourceMappingURL=restaurant.Model.js.map