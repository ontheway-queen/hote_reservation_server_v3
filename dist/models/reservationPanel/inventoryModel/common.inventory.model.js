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
class CommonInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Category  ======================//
    // create Category
    createCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("categories")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Category
    getAllCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, limit, skip, name, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("categories as c");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("c.id", "c.hotel_code", "c.name", "c.status", "c.is_deleted")
                .andWhere("c.is_deleted", false)
                .where(function () {
                this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (id) {
                    this.andWhere("c.id", id);
                }
                if (name) {
                    this.andWhere("c.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("c.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("c.id", "!=", excludeId);
                }
            })
                .orderBy("c.id", "desc");
            const total = yield this.db("categories as c")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("c.id as total")
                .where(function () {
                this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (id) {
                    this.andWhere("c.id", id);
                }
                if (name) {
                    this.andWhere("c.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("c.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("c.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Category
    updateCategory(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("categories")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    //=================== Unit  ======================//
    // create Unit
    createUnit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("units")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Unit
    getAllUnit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, key, status, hotel_code, excludeId, short_code } = payload;
            const dtbs = this.db("units as u");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("u.id", "u.hotel_code", "u.name", "u.short_code", "u.status", "u.is_deleted")
                .where(function () {
                this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
            })
                .andWhere("u.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.andWhere((qb) => {
                        qb.where("u.name", "like", `%${key}%`).orWhere("u.short_code", "like", `%${key}%`);
                    });
                }
                // by lowercase and equal not like
                if (short_code) {
                    this.whereRaw("LOWER(u.short_code) = ?", [short_code.toLowerCase()]);
                }
                if (status) {
                    this.andWhere("u.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("u.id", "!=", excludeId);
                }
            })
                .orderBy("u.id", "desc");
            const total = yield this.db("units as u")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("u.id as total")
                .where(function () {
                this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
            })
                .andWhere("u.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.andWhere((qb) => {
                        qb.where("u.name", "like", `%${key}%`).orWhere("u.short_code", "like", `%${key}%`);
                    });
                }
                if (status) {
                    this.andWhere("u.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("u.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Unit
    updateUnit(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("units")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    //=================== Brand  ======================//
    // create Brand
    createBrand(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("brands")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Brand
    getAllBrand(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("brands as b");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("b.id", "b.hotel_code", "b.name", "b.status", "b.is_deleted")
                .andWhere("b.is_deleted", false)
                .where(function () {
                this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("b.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (excludeId) {
                    this.andWhere("b.id", "!=", excludeId);
                }
            })
                .orderBy("b.id", "desc");
            const total = yield this.db("brands as b")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("b.id as total")
                .andWhere("b.is_deleted", false)
                .where(function () {
                this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("b.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (excludeId) {
                    this.andWhere("b.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Brand
    updateBrand(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("brands")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
}
exports.default = CommonInventoryModel;
//# sourceMappingURL=common.inventory.model.js.map