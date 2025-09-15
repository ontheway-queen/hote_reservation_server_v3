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
class ProductInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Product  ======================//
    // create Product
    createProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .withSchema(this.INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Product
    getAllProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, key, in_stock, hotel_code, unit, category, brand, pd_ids, } = payload;
            const dtbs = this.db("products as p");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.INVENTORY_SCHEMA)
                .select("p.id", "p.product_code", "p.name", "p.model", "c.name as category", "u.name as unit", "b.name as brand", "i.available_quantity as in_stock", "p.status as status", "p.details", "p.image")
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
                    this.andWhere("p.status", "like", `%${in_stock}%`);
                }
                if (pd_ids) {
                    this.whereIn("p.id", pd_ids);
                }
            })
                .orderBy("p.id", "desc");
            const total = yield this.db("products as p")
                .withSchema(this.INVENTORY_SCHEMA)
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
                    this.andWhere("p.status", "like", `%${in_stock}%`);
                }
                if (pd_ids) {
                    this.whereIn("p.id", pd_ids);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get all Products for last id
    getAllProductsForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .select("id")
                .withSchema(this.INVENTORY_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // Update Product
    updateProduct(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("products")
                .withSchema(this.INVENTORY_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    //=================== Damaged Product  ======================//
    // create Damaged Product
    createDamagedProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("damaged_product")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Damaged Product
    getAllDamagedProduct(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key } = payload;
            const dtbs = this.db("damaged_product_view as dv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("dv.hotel_code", hotel_code)
                .orderBy("dv.dmp_id", "desc");
            const total = yield this.db("damaged_product_view as dv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("dv.dmp_id as total")
                .where("dv.hotel_code", hotel_code);
            return { total: total[0].total, data };
        });
    }
    // get single Damaged Product
    getSingleDamagedProduct(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("damaged_product_view as dv")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("dv.*")
                .where("dv.id", id)
                .andWhere("dv.hotel_code", hotel_code);
        });
    }
}
exports.default = ProductInventoryModel;
//# sourceMappingURL=product.inventory.model.js.map