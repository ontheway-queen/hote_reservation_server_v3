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
class RestaurantTableModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
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
}
exports.default = RestaurantTableModel;
//# sourceMappingURL=restaurant.table.model.js.map