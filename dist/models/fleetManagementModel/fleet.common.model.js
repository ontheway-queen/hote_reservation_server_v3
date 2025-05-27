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
class FleetCommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Owner ======================//
    // Create owners
    createOwner(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("owners")
                .withSchema(this.FLEET_SCHEMA)
                .insert(payload);
        });
    }
    // Get all Owner
    getAllOwner(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, key, hotel_code, limit, skip } = payload;
            const dtbs = this.db("owners as o");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.FLEET_SCHEMA)
                .select("o.id", "o.name", "o.email", "o.phone", "o.address", "o.occupation", "o.photo", "o.status")
                .where("o.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("o.name", "like", `%${key}%`).orWhere("o.phone", "like", `%${key}%`);
                }
                if (id) {
                    this.andWhere("o.id", "like", `%${id}%`);
                }
            })
                .orderBy("o.id", "desc");
            const total = yield this.db("owners as o")
                .withSchema(this.FLEET_SCHEMA)
                .count("o.id as total")
                .where("o.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("o.name", "like", `%${key}%`).orWhere("o.phone", "like", `%${key}%`);
                }
                if (id) {
                    this.andWhere("o.id", "like", `%${id}%`);
                }
            });
            return { data, total: total[0].total };
        });
    }
    // get single owner
    getSingleOwner(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("owner_view as ov")
                .withSchema(this.FLEET_SCHEMA)
                .select("*")
                .where("ov.id", id)
                .andWhere("ov.hotel_code", hotel_code);
        });
    }
    // Update owner
    updateOwner(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("owners")
                .withSchema(this.FLEET_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    //=================== Driver ======================//
    // Create Driver
    createDriver(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("drivers")
                .withSchema(this.FLEET_SCHEMA)
                .insert(payload);
        });
    }
    // Get all Driver
    getAllDriver(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, id, hotel_code, limit, skip, status } = payload;
            const dtbs = this.db("drivers as d");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.FLEET_SCHEMA)
                .select("d.id", "d.name", "d.phone", "d.photo", "d.license_class", "d.licence_number", "d.year_of_experience", "d.expiry_date", "d.status")
                .where("d.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("d.name", "like", `%${key}%`).orWhere("d.phone", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("d.status", "like", `%${status}%`);
                }
                if (id) {
                    this.andWhere("d.id", "like", `%${id}%`);
                }
            })
                .orderBy("d.id", "desc");
            const total = yield this.db("drivers as d")
                .withSchema(this.FLEET_SCHEMA)
                .count("d.id as total")
                .where("d.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("d.name", "like", `%${key}%`).orWhere("d.phone", "like", `%${key}%`);
                }
                if (status) {
                    this.andWhere("d.status", "like", `%${status}%`);
                }
                if (id) {
                    this.andWhere("d.id", "like", `%${id}%`);
                }
            });
            return { data, total: total[0].total };
        });
    }
    // get single Driver
    getSingleDriver(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("driver_view as d")
                .withSchema(this.FLEET_SCHEMA)
                .select("*")
                .where("d.id", id)
                .andWhere("d.hotel_code", hotel_code);
        });
    }
    // Update Driver
    updateDriver(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("drivers")
                .withSchema(this.FLEET_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
}
exports.default = FleetCommonModel;
//# sourceMappingURL=fleet.common.model.js.map