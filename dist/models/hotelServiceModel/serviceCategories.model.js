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
class ServiceCategoriesModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createServiceCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("service_categories")
                .withSchema(this.HOTEL_SERVICE_SCHEMA)
                .insert(payload);
        });
    }
    getServiceCategory(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("service_categories")
                .withSchema(this.HOTEL_SERVICE_SCHEMA)
                .select("*")
                .where("hotel_code", where.hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => {
                if (where.id) {
                    qb.andWhere("id", where.id);
                }
                if (where.name) {
                    qb.andWhere("name", "ilike", `%${where.name}%`);
                }
            })
                .first();
        });
    }
    getServiceCategories(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, limit, skip, key } = query;
            const baseQuery = this.db("service_categories as sc")
                .withSchema(this.HOTEL_SERVICE_SCHEMA)
                .joinRaw(`LEFT JOIN ?? as ua ON sc.created_by = ua.id`, [
                `${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
            ])
                .where("sc.hotel_code", hotel_code)
                .andWhere("sc.is_deleted", false)
                .modify((qb) => {
                if (key) {
                    qb.andWhere("sc.name", "ilike", `%${key}%`);
                }
            })
                .orderBy("sc.id", "desc");
            const totalQuery = this.db
                .count("* as total")
                .from(baseQuery.clone().as("sub"));
            const [totalResult] = yield totalQuery;
            const total = parseInt(totalResult.total, 10);
            const dataQuery = baseQuery.clone();
            if (limit)
                dataQuery.limit(limit);
            if (skip)
                dataQuery.offset(skip);
            const data = yield dataQuery.select("sc.id", "sc.hotel_code", "sc.name", "sc.status", "ua.name as created_by", "sc.is_deleted", "sc.created_at", this.db.raw(`
    (
      SELECT COUNT(*) 
      FROM ?? as s
      WHERE s.category_id = sc.id
        AND s.hotel_code = sc.hotel_code
        AND s.is_deleted = false
    ) as service_count
  `, [`${this.HOTEL_SERVICE_SCHEMA}.services`]));
            return { total, data };
        });
    }
    updateServiceCategory(where, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("service_categories")
                .withSchema(this.HOTEL_SERVICE_SCHEMA)
                .update(payload)
                .where("id", where.id)
                .andWhere("hotel_code", where.hotel_code);
        });
    }
}
exports.default = ServiceCategoriesModel;
//# sourceMappingURL=serviceCategories.model.js.map