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
class RAdministrationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getHotelAllPermissionByHotel({ hotel_code, ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "permission_id")
                .where({ hotel_code })
                .andWhere(function () {
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("id", ids);
                }
            });
        });
    }
    getHotelPermissionViewByHotel({ hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hotel_code", "permissions")
                .where({ hotel_code })
                .first();
        });
    }
    updateRolePermission(payload, h_permission_id, role_id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("role_id", role_id)
                .andWhere("h_permission_id", h_permission_id)
                .andWhere("hotel_code", hotel_code);
        });
    }
    createPermission({ permission_group_id, name, created_by, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertObj = name.map((item) => {
                return {
                    permission_group_id,
                    name: item,
                    created_by,
                    hotel_code,
                };
            });
            return yield this.db("permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(insertObj);
        });
    }
    insertInRolePermission(insertObj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(insertObj);
        });
    }
    getRolePermissionByRole({ h_permission_ids, hotel_code, role_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("h_permission_id", "role_id", "read", "write", "update", "delete")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (h_permission_ids === null || h_permission_ids === void 0 ? void 0 : h_permission_ids.length) {
                    this.whereIn("h_permission_id", h_permission_ids);
                }
            })
                .andWhere("role_id", role_id);
        });
    }
    deleteRolePermission(h_permission_id, permission_type, role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("role_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .andWhere("h_permission_id", h_permission_id)
                .andWhere("permission_type", permission_type)
                .andWhere("role_id", role_id)
                .delete();
            return res;
        });
    }
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllRole({ hotel_code, limit, skip, search, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("roles as rl")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rl.id as role_id", "rl.name as role_name", "ua.name as created_by", "rl.status", "rl.created_at", "rl.init_role")
                .leftJoin("user_admin as ua", "ua.id", "rl.created_by")
                .where("rl.hotel_code", hotel_code)
                .andWhere(function () {
                if (search) {
                    this.andWhere("rl.name", "ilike", `%${search}%`);
                }
            })
                .limit(limit ? limit : 100)
                .offset(skip ? skip : 0)
                .orderBy("rl.id", "asc");
            const count = yield this.db("roles as rl")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rl.id as total")
                .where("rl.hotel_code", hotel_code)
                .andWhere(function () {
                if (search) {
                    this.andWhere("rl.name", "ilike", `%${search}%`);
                }
            });
            return { data, total: parseInt((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) | 0 };
        });
    }
    getSingleRoleByView({ id, hotel_code, role_name, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permission_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .andWhere({ hotel_code })
                .andWhere(function () {
                if (role_name) {
                    this.where("LOWER(role_name)", role_name.toLowerCase());
                }
                if (id) {
                    this.where("role_id", id);
                }
            })
                .first();
        });
    }
    updateSingleRole(id, body, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(body)
                .where({ id })
                .andWhere({ hotel_code });
        });
    }
    getRoleByName(name, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere(function () {
                if (name) {
                    this.whereRaw("LOWER(name) = ?", [name.toLowerCase()]);
                }
            });
        });
    }
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get all admin
    getAllAdmin(filter) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, role_id, search, skip, status, hotel_code, owner } = filter;
            const data = yield this.db("user_admin as ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.name", "ua.email", "ua.phone", "ua.photo", "rl.name as role", "rl.id as role_id", "ua.status", "ua.owner")
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .where((qb) => {
                if (search) {
                    qb.where((qbc) => {
                        qbc.where("ua.name", "ilike", `%${search}%`);
                        qbc.orWhere("ua.email", "ilike", `%${search}%`);
                    });
                }
                if (role_id) {
                    qb.andWhere("rl.id", role_id);
                }
                qb.andWhere("ua.hotel_code", hotel_code);
                if (status) {
                    qb.andWhere("ua.status", status);
                }
                if (owner) {
                    qb.andWhere("ua.owner", owner);
                }
            })
                .orderBy("ua.name", "asc")
                .limit(limit || 100)
                .offset(skip || 0);
            let total = [];
            total = yield this.db("user_admin as ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("ua.id as total")
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .where((qb) => {
                if (search) {
                    qb.where((qbc) => {
                        qbc.where("ua.name", "ilike", `%${search}%`);
                        qbc.orWhere("ua.email", "ilike", `%${search}%`);
                    });
                }
                if (role_id) {
                    qb.andWhere("rl.id", role_id);
                }
                qb.andWhere("ua.hotel_code", hotel_code);
                if (status) {
                    qb.andWhere("ua.status", status);
                }
                if (owner) {
                    qb.andWhere("ua.owner", owner);
                }
            });
            return {
                data: data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleAdmin(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id, hotel_code } = where;
            return yield this.db("user_admin AS ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.email", "ua.hotel_code", "h.name as hotel_name", "h.status as hotel_status", "ua.phone", "ua.password", "ua.photo", "ua.name", "ua.status", "r.id as role_id", "r.name as role_name", "ua.created_at", this.db.raw(`
        JSON_BUILD_OBJECT(
          'phone', hcd.phone,
          'fax', hcd.fax,
          'address',h.address,
          'website_url', hcd.website_url,
          'email', hcd.email,
          'logo',hcd.logo
        ) as hotel_contact_details
      `))
                .join("hotels as h", "ua.hotel_code", "h.hotel_code")
                .leftJoin("hotel_contact_details as hcd", "h.hotel_code", "hcd.hotel_code")
                .leftJoin("roles as r", "ua.role_id", "r.id")
                .modify(function (queryBuilder) {
                if (id) {
                    queryBuilder.where("ua.id", id);
                }
                if (email) {
                    queryBuilder.whereRaw("LOWER(ua.email) = ? ", [email.toLowerCase()]);
                }
                if (hotel_code) {
                    queryBuilder.where("ua.hotel_code", hotel_code);
                }
            })
                .first();
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
exports.default = RAdministrationModel;
//# sourceMappingURL=rAdministration.model.js.map