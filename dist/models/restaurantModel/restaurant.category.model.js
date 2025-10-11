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
class RestaurantCategoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
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
}
exports.default = RestaurantCategoryModel;
//# sourceMappingURL=restaurant.category.model.js.map