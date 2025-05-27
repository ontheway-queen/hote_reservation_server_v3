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
class StockInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create stock
    createStockIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    createStockOut(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All stock
    getAllStock(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, status } = payload;
            const dtbs = this.db("stock_view as sv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("sv.id", "sv.created_at as date", "a.name as account_name", "a.ac_type as account_type", "sv.status", "sv.paid_amount", "sv.note")
                .where("sv.hotel_code", hotel_code)
                .leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("sv.status", "like", `%${status}%`);
                }
            })
                .orderBy("sv.id", "desc");
            const total = yield this.db("stock_view as sv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("sv.id as total")
                .where("sv.hotel_code", hotel_code)
                .leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("sv.status", "like", `%${status}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single stock
    getSingleStock(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("stock_view as sv");
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("sv.*", "a.name as account_name", "a.ac_type as account_type")
                .leftJoin("account as a", "sv.ac_tr_ac_id", "a.id")
                .where("sv.id", id)
                .andWhere("sv.hotel_code", hotel_code);
            return data.length > 0 ? data[0] : [];
        });
    }
    // create stock item
    createStockItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock_item")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert in inventory
    insertInInventory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // update in inventory
    updateInInventory(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    // get all inventory
    getAllInventory(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { product_id, hotel_code } = where;
            return yield this.db("inventory")
                .withSchema(this.RESERVATION_SCHEMA)
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
                .withSchema(this.RESERVATION_SCHEMA)
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