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
class HotelRestaurantAdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createRestaurantAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload);
        });
    }
    getAllRestaurantAdminEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, hotel_code } = payload;
            const dtbs = this.db("user_admin as ua");
            const data = yield dtbs
                .withSchema(this.RESTAURANT_SCHEMA)
                .where({ "ua.hotel_code": hotel_code })
                .andWhere({ "ua.email": email })
                .orderBy("id", "desc");
            return data.length > 0 ? data[0] : null;
        });
    }
    getRestaurantAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email } = payload;
            const dtbs = this.db("user_admin as ua");
            return yield dtbs
                .withSchema(this.RESTAURANT_SCHEMA)
                .where(function () {
                if (id) {
                    this.where({ "ua.id": id });
                }
                if (email) {
                    this.where({ "ua.email": email });
                }
            })
                .first();
        });
    }
    updateRestaurantAdmin({ id, email, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.RESTAURANT_SCHEMA)
                .update(payload)
                .where(function () {
                if (id) {
                    this.andWhere({ id });
                }
                if (email) {
                    this.andWhere({ email });
                }
            });
        });
    }
    getRestaurantAdminProfile(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = payload;
            const dtbs = this.db("user_admin as ua");
            return yield dtbs
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("ua.id", "ua.name", "ua.email", "ua.phone", "ua.photo", "ua.status", "ua.role_id", "r.id as restaurant_id", "r.name as restaurant_name", "r.photo as restaurant_photo", "r.email as restaurant_email", "r.phone as restaurant_phone", "r.address as restaurant_address", "r.city as restaurant_city", "r.country as restaurant_country", "r.bin_no as restaurant_bin_no", "r.status as restaurant_status")
                .leftJoin("restaurant as r", "r.id", "ua.restaurant_id")
                .where({ "ua.id": id, "ua.hotel_code": hotel_code })
                .first();
        });
    }
}
exports.default = HotelRestaurantAdminModel;
//# sourceMappingURL=restaurant.admin.model.js.map