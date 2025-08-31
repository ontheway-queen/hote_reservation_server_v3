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
class MConfigurationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAllAccomodation({ status }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accomodation_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where((query) => {
                if (status) {
                    query.where("status", status);
                }
            });
        });
    }
    getSingleAccomodation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accomodation_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ id });
        });
    }
    insertCity(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("city").withSchema(this.PUBLIC_SCHEMA).insert(body);
        });
    }
    getAllCity({ limit, skip, search, country_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("city")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("*")
                .where((query) => {
                if (search) {
                    query.where("status", "ilike", `%${search}%`);
                }
                if (country_code) {
                    query.where("country_code", country_code);
                }
            })
                .limit(limit || 30)
                .offset(skip || 0);
        });
    }
    getLastCityCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("city")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("city_code")
                .orderBy("city_code", "desc")
                .limit(1);
            return data.length ? data[0].city_code : 2025;
        });
    }
    getAllCountry({ limit, skip, search, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("country");
            if (limit && skip) {
                dtbs.limit(limit);
                dtbs.offset(skip);
            }
            return yield dtbs
                .withSchema(this.PUBLIC_SCHEMA)
                .select("*")
                .where((query) => {
                if (search) {
                    query
                        .where("country_code_2_letter", "ilike", `%${search}%`)
                        .orWhere("country_name", "ilike", `${search}`);
                }
            });
        });
    }
    //-------------------- permission ---------------- //
    createPermissionGroup(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(body);
        });
    }
    getAllRolePermissionGroup(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, name } = payload;
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name")
                .where(function () {
                if (name) {
                    this.where("name", "like", `%${name}%`);
                }
                if (id) {
                    this.andWhere({ id });
                }
            });
        });
    }
    getSinglePermissionGroup(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ id });
        });
    }
    createPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all permission
    getAllPermissionByHotel(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .first();
        });
    }
    // get all permission
    getAllPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ids } = payload;
            return yield this.db("permissions AS p")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("p.id AS permission_id", "p.name As permission_name", "p.permission_group_id", "pg.name AS permission_group_name")
                .join("permission_group AS pg", "p.permission_group_id", "pg.id")
                .where(function () {
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("p.id", ids);
                }
            });
        });
    }
    // added hotel permission
    addedHotelPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    // create hotel permission
    deleteHotelPermission(hotel_code, permission_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .whereIn("permission_id", permission_id)
                .andWhere({ hotel_code })
                .delete();
        });
    }
    // delete hotel hotel role permission
    deleteHotelRolePermission(hotel_code, h_permission_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .whereIn("h_permission_id", h_permission_id)
                .andWhere({ hotel_code })
                .delete();
        });
    }
    createAmenitiesHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("amenity_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllAmenitiesHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status } = payload;
            const dtbs = this.db("amenity_heads");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name", "status")
                .where(function () {
                if (search) {
                    this.andWhere("name", "like", `%${search}%`);
                }
                if (status) {
                    this.andWhere("status", status);
                }
            })
                .orderBy("id", "desc");
            return { data };
        });
    }
    updateAmenitiesHead(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("amenity_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    createAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status, head_id } = payload;
            const dtbs = this.db("amenities");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name", "icon", "status")
                .where(function () {
                if (search) {
                    this.andWhere("name", "like", `%${search}%`);
                }
                if (status) {
                    this.andWhere("status", status);
                }
                if (head_id) {
                    this.andWhere("head_id", head_id);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where(function () {
                if (search) {
                    this.andWhere("name", "like", `%${search}%`);
                }
                if (status) {
                    this.andWhere("status", status);
                }
                if (head_id) {
                    this.andWhere("head_id", head_id);
                }
            });
            return { total: total[0].total, data };
        });
    }
    updateAmenities(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    deleteAmenities(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_amenities_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .del();
        });
    }
}
exports.default = MConfigurationModel;
//# sourceMappingURL=mConfigurationModel.js.map