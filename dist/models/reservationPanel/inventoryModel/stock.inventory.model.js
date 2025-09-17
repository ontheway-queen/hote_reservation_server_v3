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
                .insert(payload, "id");
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
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("sv.stock_id", "sv.created_at as date", "acc.name as account_name", "acc.acc_type as account_type", "sv.status", "sv.paid_amount", "sv.note")
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
            const total = yield this.db("stock_view as sv")
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
        });
    }
    // get single stock
    getSingleStock(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock_view as sv")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("sv.*")
                .where("sv.stock_id", id)
                .andWhere("sv.hotel_code", hotel_code)
                .first();
        });
    }
    // update stock
    updateStockItems(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("stock_items")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .update(payload)
                .where("id", where.id);
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
                .modify((qb) => {
                if (where.product_id) {
                    qb.where("product_id", where.product_id);
                }
                if (where.id) {
                    qb.where("id", where.id);
                }
            });
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