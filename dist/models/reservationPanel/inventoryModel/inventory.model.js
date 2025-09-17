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
const schema_1 = __importDefault(require("../../../utils/miscellaneous/schema"));
class InventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getInventoryDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, key, hotel_code } = payload;
            const baseQuery = this.db("inventory as i")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .leftJoin("products as p", "p.id", "i.product_id")
                .leftJoin("categories as c", "c.id", "p.category_id")
                .where("i.hotel_code", hotel_code)
                .modify((qb) => {
                if (key) {
                    qb.andWhere("p.name", "ilike", `%${key}%`);
                }
            });
            // get total count
            const totalResult = yield baseQuery
                .clone()
                .count("i.id as count")
                .first();
            const total = totalResult ? parseInt(totalResult.count, 10) : 0;
            // get paginated data
            if (limit)
                baseQuery.limit(limit);
            if (skip)
                baseQuery.offset(skip);
            const data = yield baseQuery
                .select("i.id", "p.product_code", "p.name as product_name", "c.name as category", "i.available_quantity", "i.quantity_used", "i.total_damaged")
                .orderBy("i.id", "desc");
            return { total, data };
        });
    }
    getSingleInventoryDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id } = payload;
            return yield this.db("inventory as i")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("i.id", "i.hotel_code", "i.product_id", "p.product_code", "p.model as product_model", "p.name as product_name", "p.details as product_details", "p.image as product_image", "p.status as product_status", "p.category_id", "c.name as category", "p.unit_id", "u.name as unit", "p.brand_id", "b.name as brand", "i.available_quantity", "i.quantity_used", "i.total_damaged")
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
        });
    }
}
exports.default = InventoryModel;
//# sourceMappingURL=inventory.model.js.map