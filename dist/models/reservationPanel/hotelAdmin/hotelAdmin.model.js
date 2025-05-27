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
class HotelAdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert user admin
    insertUserAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            return yield this.db("user_admin")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getSingleAdmin(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id } = where;
            return yield this.db("user_admin AS ua")
                .select("ua.id", "ua.email", "ua.hotel_code", "ua.phone", "ua.password", "ua.photo", "ua.name", "ua.status", "r.id As role_id", "r.name As role_name", "ua.created_at")
                .withSchema(this.RESERVATION_SCHEMA)
                .join("hotels as h", "ua.hotel_code", "h.hotel_code")
                .join("hotel_others_info as hoi", "ua.hotel_code", "h.hotel_code")
                .join("roles AS r", "ua.role", "r.id")
                .where(function () {
                if (id) {
                    this.where("ua.id", id);
                }
                if (email) {
                    this.where("ua.email", email);
                }
            });
        });
    }
    // get all admin
    getAllAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, hotel_code } = payload;
            const dtbs = this.db("user_admin AS ua");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.email", "ua.name", "ua.avatar", "ua.phone", "ua.status", "r.id As role_id", "r.name As role_name", "ua.created_at")
                .leftJoin("role AS r", "ua.role", "r.id")
                .where(function () {
                if (status) {
                    this.where("ua.status", status);
                }
                this.andWhere("ua.hotel_code", hotel_code);
            });
            const total = yield this.db("user_admin AS ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("ua.id As total")
                .leftJoin("role AS r", "ua.role", "r.id")
                .where(function () {
                if (status) {
                    this.where("ua.status", status);
                }
                this.andWhere("ua.hotel_code", hotel_code);
            });
            return { data, total: total[0].total };
        });
    }
    // update admin model
    updateAdmin(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id } = where;
            return yield this.db("user_admin")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where(function () {
                if (email) {
                    this.andWhere({ email });
                }
                if (id) {
                    this.andWhere({ id });
                }
            });
        });
    }
}
exports.default = HotelAdminModel;
//# sourceMappingURL=hotelAdmin.model.js.map