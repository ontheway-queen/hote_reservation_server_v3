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
}
exports.default = RestaurantModel;
//# sourceMappingURL=restaurant.Model.js.map