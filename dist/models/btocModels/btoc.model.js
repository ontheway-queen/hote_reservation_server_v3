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
exports.BtocUserModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class BtocUserModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Check user
    checkUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = query;
            return yield this.db("users")
                .withSchema(this.BTOC_SCHEMA)
                .select("*")
                .where("email", email)
                .andWhere("is_deleted", false)
                .first();
        });
    }
    // create user
    createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("users")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload)
                .returning(["id", "email"]);
        });
    }
    // get profile
    getProfile(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("users as u")
                .withSchema(this.BTOC_SCHEMA)
                .select("u.id", "u.first_name", "u.last_name", "u.email", "u.phone", "u.photo", "u.status", "u.gender", "u.address", "u.date_of_birth", "city.city_name as city", "country.country_name as country", "u.is_deleted")
                //   .joinRaw("LEFT JOIN ?? city ON city.city_code = u.city_id", [
                //     `${this.PUBLIC_SCHEMA}.${this.TABLES.city}`,
                //   ])
                //   .joinRaw("LEFT JOIN ?? country ON country.id = u.country_id", [
                //     `${this.PUBLIC_SCHEMA}.${this.TABLES.country}`,
                //   ])
                .modify((qb) => {
                if (query.id)
                    qb.where("u.id", query.id);
                if (query.email)
                    qb.where("u.email", query.email);
            })
                .andWhere("u.is_deleted", false)
                .first();
        });
    }
    // update profile
    updateProfile({ payload, id, email, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("users")
                .withSchema(this.BTOC_SCHEMA)
                .modify((qb) => {
                if (id)
                    qb.where("id", id);
                if (email)
                    qb.where("email", email);
            })
                .update(payload)
                .returning("id");
        });
    }
}
exports.BtocUserModel = BtocUserModel;
//# sourceMappingURL=btoc.model.js.map