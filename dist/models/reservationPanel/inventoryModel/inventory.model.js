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
    createProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    getAllProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, key, in_stock, hotel_code, unit, category, brand, pd_ids, } = payload;
            const dtbs = this.db("products as p");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("p.id", "p.product_code", "p.name", "p.model", "p.category_id", "c.name as category", "p.unit_id", "u.name as unit", "p.brand_id", "b.name as brand", "i.available_quantity as in_stock", "p.status as status", "p.details", "p.image")
                .where("p.hotel_code", hotel_code)
                .leftJoin("categories as c", "p.category_id", "c.id")
                .leftJoin("inventory as i", "p.id", "i.product_id")
                .leftJoin("units as u", "p.unit_id", "u.id")
                .leftJoin("brands as b", "p.brand_id", "b.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("p.name", "like", `%${key}%`).orWhere("p.model", "like", `%${key}%`);
                }
                if (unit) {
                    this.andWhere("u.name", "like", `%${unit}%`);
                }
                if (category) {
                    this.andWhere("c.name", "like", `%${category}%`);
                }
                if (brand) {
                    this.andWhere("b.name", "like", `%${brand}%`);
                }
                if (in_stock) {
                    this.whereExists(function () {
                        if (in_stock === "1")
                            this.select("*")
                                .from("hotel_inventory.inventory as i")
                                .whereRaw("i.product_id = p.id")
                                .andWhere("i.available_quantity", ">", 0);
                        else if (in_stock === "0")
                            this.select("*")
                                .from("hotel_inventory.inventory as i")
                                .whereRaw("i.product_id = p.id")
                                .andWhere("i.available_quantity", "<=", 0);
                    });
                }
                if (pd_ids) {
                    this.whereIn("p.id", pd_ids);
                }
            })
                .orderBy("p.id", "desc");
            const total = yield this.db("products as p")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("p.id as total")
                .where("p.hotel_code", hotel_code)
                .leftJoin("categories as c", "p.category_id", "c.id")
                .leftJoin("inventory as i", "p.id", "i.product_id")
                .leftJoin("units as u", "p.unit_id", "u.id")
                .leftJoin("brands as b", "p.brand_id", "b.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("p.name", "like", `%${key}%`).orWhere("p.model", "like", `%${key}%`);
                }
                if (unit) {
                    this.andWhere("u.name", "like", `%${unit}%`);
                }
                if (category) {
                    this.andWhere("c.name", "like", `%${category}%`);
                }
                if (brand) {
                    this.andWhere("b.name", "like", `%${brand}%`);
                }
                if (in_stock) {
                    this.whereExists(function () {
                        if (in_stock === "1")
                            this.select("*")
                                .from("hotel_inventory.inventory as i")
                                .whereRaw("i.product_id = p.id")
                                .andWhere("i.available_quantity", ">", 0);
                        else if (in_stock === "0")
                            this.select("*")
                                .from("hotel_inventory.inventory as i")
                                .whereRaw("i.product_id = p.id")
                                .andWhere("i.available_quantity", "<=", 0);
                    });
                }
                if (pd_ids) {
                    this.whereIn("p.id", pd_ids);
                }
            });
            return { total: total[0].total, data };
        });
    }
    getAllProductsForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .select("id")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    updateProduct(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    createDamagedProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("damaged_products")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    getAllDamagedProduct(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, key, limit = 10, skip = 0, date_from, date_to, } = params;
            console.log("date_from:", date_from);
            console.log("date_to:", date_to);
            const query = this.db("damaged_products as dm")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("dm.id", "dm.hotel_code", "dm.product_id", "pv.name", "pv.model", "pv.product_code", "u.name as unit_name", "b.name as brand_name", "dm.quantity", "dm.note", "dm.created_at", "ua.name as inserted_by")
                .leftJoin("products as pv", "dm.product_id", "pv.id")
                .leftJoin("units as u", "u.id", "pv.unit_id")
                .leftJoin("brands as b", "b.id", "pv.brand_id")
                .joinRaw(`LEFT JOIN ?? as ua ON ua.id = dm.created_by`, [
                `${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
            ])
                .where("dm.hotel_code", hotel_code);
            if (key) {
                query.andWhere((qb) => {
                    qb.whereILike("pv.name", `%${key}%`)
                        .orWhereILike("pv.model", `%${key}%`)
                        .orWhereILike("pv.product_code", `%${key}%`)
                        .orWhereILike("b.name", `%${key}%`);
                });
            }
            if (date_from)
                query.andWhereRaw("DATE(dm.created_at) >= ?", [date_from]);
            if (date_to)
                query.andWhereRaw("DATE(dm.created_at) <= ?", [date_to]);
            const totalResult = yield query
                .clone()
                .clearSelect()
                .count("* as count")
                .first();
            const total = Number((totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) || 0);
            const data = yield query
                .orderBy("dm.created_at", "desc")
                .limit(limit)
                .offset(skip);
            return {
                total,
                data,
            };
        });
    }
    // get single Damaged Product
    getSingleDamagedProduct(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("damaged_product_view as dv")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("dv.*")
                .where("dv.id", id)
                .andWhere("dv.hotel_code", hotel_code);
        });
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
exports.default = InventoryModel;
//# sourceMappingURL=inventory.model.js.map