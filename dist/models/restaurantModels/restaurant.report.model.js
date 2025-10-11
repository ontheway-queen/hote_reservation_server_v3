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
class RestaurantReportModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getOrderInfo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = query;
            const result = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
      COALESCE(SUM(o.grand_total), 0) AS "lifeTimeSales",
      COUNT(o.id) AS "lifeTimeSalesCount",

      COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.grand_total END), 0) AS "todaySales",
      COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN 1 END) AS "todaySalesCount",

      COALESCE(SUM(CASE 
        WHEN DATE_PART('week', o.created_at) = DATE_PART('week', CURRENT_DATE)
         AND DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "weeklySales",
      COUNT(CASE 
        WHEN DATE_PART('week', o.created_at) = DATE_PART('week', CURRENT_DATE)
         AND DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN 1 END) AS "weeklySalesCount",

      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "monthlySales",
      COUNT(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN 1 END) AS "monthlySalesCount",

      COALESCE(SUM(CASE WHEN DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN o.grand_total END), 0) AS "yearlySales",
      COUNT(CASE WHEN DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
        THEN 1 END) AS "yearlySalesCount"
    `))
                .from("orders as o")
                .where({ hotel_code, restaurant_id })
                .andWhere("o.status", "completed")
                .first();
            return result;
        });
    }
    getDailyOrderCounts(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id, to_date, from_date } = query;
            console.log({ to_date, from_date });
            const result = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
      gs.date::date AS "date",
      COUNT(o.id) AS "count"
    `))
                .fromRaw(`
  generate_series(
    '${from_date}'::date,
    '${to_date}'::date,
    interval '1 day'
  ) AS gs(date)
  LEFT JOIN hotel_restaurant.orders o
    ON DATE(o.created_at) = gs.date
    AND o.hotel_code = ${hotel_code}
    AND o.restaurant_id = ${restaurant_id}
    AND o.status = 'completed'
`)
                .groupBy("gs.date")
                .orderBy("gs.date");
            const dates = result.map((r) => r.date);
            const counts = result.map((r) => Number(r.count));
            return {
                dates,
                counts,
            };
        });
    }
    getHourlyOrders(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, hotel_code, restaurant_id } = query;
            const result = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
				hour_series.hour AS hour,
				COALESCE(o_count.order_count, 0) AS order_count
			`))
                .from(this.db.raw(`
				(SELECT generate_series(00.00, 23.00) AS hour) AS hour_series
				LEFT JOIN (
					SELECT EXTRACT(HOUR FROM created_at) AS hour,
						   COUNT(id) AS order_count
					FROM hotel_restaurant.orders
					WHERE created_at::date BETWEEN ? AND ?
					  AND hotel_code = ?
					  AND restaurant_id = ?
					  AND status = 'completed'
					GROUP BY EXTRACT(HOUR FROM created_at)
				) AS o_count
				ON hour_series.hour = o_count.hour
			`, [from_date, to_date, hotel_code, restaurant_id]))
                .orderBy("hour_series.hour");
            const hourlyOrders = {};
            let totalOrders = 0;
            result.forEach((row) => {
                if (Number(row.order_count) > 0) {
                    hourlyOrders[row.hour] = Number(row.order_count);
                    totalOrders += Number(row.order_count);
                }
            });
            return {
                total: totalOrders,
                data: hourlyOrders,
            };
        });
    }
    getSellingItems(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = query;
            const fastSellingItems = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
        oi.food_id AS item_food_id,
        oi.name AS product_name,
        oi.rate AS product_retail_price,
        mc.name AS food_category_name,
        SUM(oi.quantity) AS total_quantity,
        SUM(CASE WHEN DATE(oi.created_at) = CURRENT_DATE THEN oi.quantity ELSE 0 END) AS daily_quantity,
        SUM(CASE WHEN DATE_TRUNC('week', oi.created_at) = DATE_TRUNC('week', CURRENT_DATE) THEN oi.quantity ELSE 0 END) AS weekly_quantity
      `))
                .from("order_items as oi")
                .join("orders as o", "o.id", "oi.order_id")
                .join("foods as f", "f.id", "oi.food_id")
                .join("menu_categories as mc", "mc.id", "f.menu_category_id")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhere("oi.is_deleted", false)
                .groupBy("oi.food_id", "oi.name", "oi.rate", "mc.name")
                .orderBy("total_quantity", "desc")
                .limit(5);
            const slowSellingItems = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
        oi.food_id AS item_food_id,
        oi.name AS product_name,
        oi.rate AS product_retail_price,
        mc.name AS food_category_name,
        SUM(oi.quantity) AS total_quantity,
        SUM(CASE WHEN DATE(oi.created_at) = CURRENT_DATE THEN oi.quantity ELSE 0 END) AS daily_quantity,
        SUM(CASE WHEN DATE_TRUNC('week', oi.created_at) = DATE_TRUNC('week', CURRENT_DATE) THEN oi.quantity ELSE 0 END) AS weekly_quantity
      `))
                .from("order_items as oi")
                .join("orders as o", "o.id", "oi.order_id")
                .join("foods as f", "f.id", "oi.food_id")
                .join("menu_categories as mc", "mc.id", "f.menu_category_id")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhere("oi.is_deleted", false)
                .groupBy("oi.food_id", "oi.name", "oi.rate", "mc.name")
                .orderBy("total_quantity", "asc")
                .limit(5);
            return {
                fastSellingItems,
                slowSellingItems,
            };
        });
    }
    getSellsReport(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, hotel_code, restaurant_id } = query;
            const salesOverview = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select(this.db.raw(`
        ROUND(COALESCE(SUM(o.sub_total), 0), 2) as "total_sales",
        ROUND(COALESCE(SUM(CASE WHEN o.discount_type = 'percentage' THEN (o.sub_total * o.discount / 100) ELSE o.discount END), 0), 2) as "total_discount",
        ROUND(COALESCE(SUM(o.vat_amount), 0), 2) as "total_vat",
        ROUND(COALESCE(SUM(CASE WHEN o.service_charge_type = 'percentage' THEN (o.sub_total * o.service_charge / 100) ELSE o.service_charge END), 0),2) as "total_service_charge",
        ROUND(COALESCE(SUM(o.grand_total), 0),2) as "grand_total"
      `))
                .from("orders as o")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
                from_date,
                to_date,
            ])
                .first();
            const typeWiseSales = yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("o.order_type", this.db.raw("SUM(o.net_total) as net_total_amount"))
                .from("orders as o")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
                from_date,
                to_date,
            ])
                .groupBy("o.order_type");
            return {
                salesOverview,
                typeWiseSales,
            };
        });
    }
    getProductsReport(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, hotel_code, restaurant_id, name, category, } = query;
            return yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("oi.food_id", "f.name as name", "fc.name as category", "oi.rate as price", this.db.raw("COALESCE(SUM(oi.quantity), 0) as total_quantity"), this.db.raw("COALESCE(SUM(oi.quantity * oi.rate), 0) as total_sales"))
                .from("order_items as oi")
                .leftJoin("orders as o", "oi.order_id", "o.id")
                .leftJoin("foods as f", "oi.food_id", "f.id")
                .leftJoin("menu_categories as fc", "f.menu_category_id", "fc.id")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
                from_date,
                to_date,
            ])
                .modify((queryBuilder) => {
                if (name) {
                    queryBuilder.andWhere("f.name", "ilike", `%${name}%`);
                }
                if (category) {
                    queryBuilder.andWhere("fc.name", "ilike", `%${category}%`);
                }
            })
                .groupBy("oi.food_id", "oi.rate", "f.name", "fc.name")
                .orderBy("total_sales", "desc");
        });
    }
    getUserSellsReport(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, hotel_code, restaurant_id, user_id } = query;
            return yield this.db
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("o.id", "o.order_no", "o.guest", "o.room_no", "o.order_type", "o.sub_total", "o.discount", "o.discount_type", this.db.raw(`
            CASE 
                WHEN o.discount_type = 'percentage' 
                THEN ROUND(o.sub_total * o.discount / 100, 2)
                ELSE o.discount
            END AS discount_amount
        `), "o.net_total", "o.service_charge", "o.service_charge_type", this.db.raw(`
            CASE 
                WHEN o.service_charge_type = 'percentage' 
                THEN ROUND(o.net_total * o.service_charge / 100, 2)
                ELSE o.service_charge
            END AS service_charge_amount
        `), "o.vat_rate", "o.vat_amount", "o.grand_total", "o.created_at", "u.name as user_name")
                .from("orders as o")
                .leftJoin("user_admin as u", "o.created_by", "u.id")
                .where("o.status", "completed")
                .andWhere("o.hotel_code", hotel_code)
                .andWhere("o.restaurant_id", restaurant_id)
                .andWhere("o.created_by", user_id)
                .andWhereRaw("DATE(o.created_at) BETWEEN ? AND ?", [
                from_date,
                to_date,
            ])
                .orderBy("o.created_at", "asc");
        });
    }
}
exports.default = RestaurantReportModel;
//# sourceMappingURL=restaurant.report.model.js.map