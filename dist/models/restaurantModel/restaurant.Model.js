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
    // =================== Measurement  ======================//
    createMeasurement(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("measurements")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getMeasurements(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("measurements as rt")
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
    updateMeasurement({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("measurements as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload, "id")
                .where("rt.id", id)
                .andWhere("rt.is_deleted", false);
        });
    }
    deleteMeasurement(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("measurements as rt")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("rt.id", where.id)
                .andWhere("rt.is_deleted", false);
        });
    }
    // =================== Ingredient  ======================//
    createIngredient(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ingredients")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getIngredients(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("ingredients as i")
                .withSchema(this.RESTAURANT_SCHEMA)
                .leftJoin("measurements as m", "m.id", "i.measurement_id")
                .leftJoin("user_admin as ua", "ua.id", "i.created_by")
                .where("i.hotel_code", query.hotel_code)
                .andWhere("i.restaurant_id", query.restaurant_id)
                .andWhere("i.is_deleted", false);
            if (query.id) {
                baseQuery.andWhere("i.id", query.id);
            }
            if (query.name) {
                baseQuery.andWhereILike("i.name", `%${query.name}%`);
            }
            const data = yield baseQuery
                .clone()
                .select("i.id", "i.hotel_code", "i.restaurant_id", "i.name", "m.name as measurement_name", "m.short_code as measurement_short_code", "ua.id as created_by_id", "ua.name as created_by_name", "i.is_deleted")
                .orderBy("i.id", "desc")
                .limit((_a = query.limit) !== null && _a !== void 0 ? _a : 100)
                .offset((_b = query.skip) !== null && _b !== void 0 ? _b : 0);
            const countResult = yield baseQuery
                .clone()
                .count("i.id as total");
            const total = Number(countResult[0].total);
            return { total, data };
        });
    }
    updateIngredient({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ingredients as i")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload, "id")
                .where("i.id", id)
                .andWhere("i.is_deleted", false);
        });
    }
    deleteIngredient(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ingredients as i")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update({ is_deleted: true })
                .where("i.id", where.id)
                .andWhere("i.is_deleted", false);
        });
    }
}
exports.default = RestaurantModel;
//# sourceMappingURL=restaurant.Model.js.map