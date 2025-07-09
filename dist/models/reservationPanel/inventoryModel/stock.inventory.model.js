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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../../utils/miscellaneous/schema"));
class StockInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create stock
    createStockIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stocks")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload, "id");
        });
    }
    createStockOut(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stocks")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All stock
    getAllStock(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, status } = payload;
            const dtbs = this.db("stocks as s");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("s.id", "s.created_at as date", "a.name as account_name", "a.acc_type as account_type", "s.status", "s.paid_amount", "s.note")
                .where("s.hotel_code", hotel_code)
                .joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("s.status", "like", `%${status}%`);
                }
            })
                .orderBy("s.id", "desc");
            const total = yield this.db("stocks as s")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("s.id as total")
                .where("s.hotel_code", hotel_code)
                .joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("s.status", "like", `%${status}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single stock
    getSingleStock(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const stock = yield this.db("stocks as s")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("s.*", "a.name as account_name", "a.acc_type as account_type", "ua.id as created_by_id", "ua.name as created_by_name")
                .joinRaw(`LEFT JOIN ?? ua ON ua.id = s.created_by`, [
                `${this.RESERVATION_SCHEMA}.user_admin`,
            ])
                .joinRaw(`LEFT JOIN ?? a ON a.id = s.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .where("s.id", id)
                .andWhere("s.hotel_code", hotel_code)
                .first();
            const stockItems = yield this.db("stock_items")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("product_id")
                .sum("quantity as quantity")
                .where("stock_id", id)
                .groupBy("product_id");
            const { created_by } = stock, cleanStock = __rest(stock, ["created_by"]);
            return Object.assign(Object.assign({}, cleanStock), { items: stockItems });
        });
    }
    // create stock item
    createStockItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock_items")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // insert in inventory
    insertInInventory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // update in inventory
    updateInInventory(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    // get all inventory
    getAllInventory(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { product_id, hotel_code } = where;
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (product_id) {
                    this.whereIn("product_id", product_id);
                }
            });
        });
    }
    // get all purchase ingredient item
    getInventoryList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key } = payload;
            const dtbs = this.db("inventory as inv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("inv.id", "inv.product_id", "ing.name", "ing.measurement", "inv.available_quantity", "inv.quantity_used")
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
        });
    }
}
exports.default = StockInventoryModel;
//# sourceMappingURL=stock.inventory.model.js.map