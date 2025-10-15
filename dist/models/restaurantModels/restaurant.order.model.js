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
class RestaurantOrderModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
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
            console.log(payload);
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
                .select("o.id", "o.hotel_code", "o.restaurant_id", "o.table_id", "rt.name as table_name", "o.order_type", "o.status", "o.kitchen_status", "o.created_at", "o.discount", "o.discount_amount", "o.discount_type", "o.service_charge_amount", "o.service_charge", "o.service_charge_type", "o.sub_total", "o.vat_type", "o.vat", "o.booking_ref", "o.include_with_hotel_booking", "o.room_no", "o.vat_amount", "o.grand_total", "ua.id as created_by_id", "ua.name as created_by_name")
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
                .select("o.id", "o.hotel_code", "o.restaurant_id", "o.table_id", "rt.name as table_name", "o.guest_name", "o.order_type", "o.order_no", "o.staff_id", "eu.name as staff_name", "o.status", "o.kitchen_status", "o.created_at", "o.discount_type", "o.discount", "o.discount_amount", "o.service_charge_amount", "o.service_charge", "o.service_charge_type", "o.sub_total", "o.vat_type", "o.vat", "o.booking_ref", "o.include_with_hotel_booking", "o.booking_id", "o.room_id", "o.room_no", "o.vat_amount", "o.grand_total", "o.is_paid", "ua.id as created_by_id", "ua.name as created_by_name", "o.credit_voucher_id", this.db.raw(`
				COALESCE(
					json_agg(
						json_build_object(
							'id', oi.id,
							'food_id', f.id,
							'food_name', f.name,
							'quantity', oi.quantity,
							'rate', oi.rate,
							'total', oi.total,
              'debit_voucher_id',oi.debit_voucher_id
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
exports.default = RestaurantOrderModel;
//# sourceMappingURL=restaurant.order.model.js.map