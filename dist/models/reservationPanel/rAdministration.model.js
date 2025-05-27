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
    // create module
    rolePermissionGroup(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(body);
        });
    }
    // get permission group
    getRolePermissionGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name");
        });
    }
    // create permission
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
    // create hotel permission
    addedHotelPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all hotel permission
    getAllHotelPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, ids } = payload;
            console.log({ ids, hotel_code });
            return yield this.db("hotel_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "hotel_code", "permission_id")
                .where(function () {
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("id", ids);
                }
                if (hotel_code) {
                    this.where({ hotel_code });
                }
            });
        });
    }
    // v2 get all hotel permission code
    getAllHotelPermissions(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = payload;
            return yield this.db("hotel_permission_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hotel_code", "permissions")
                .where(function () {
                if (hotel_code) {
                    this.where({ hotel_code });
                }
            });
        });
    }
    // create role permission
    createRolePermission(insertObj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permission")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(insertObj);
        });
    }
    // delete role perimission
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
    // create role
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    // get role
    getAllRole(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code });
        });
    }
    // get single role
    getSingleRole(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("role_permission_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("role_id", id)
                .andWhere({ hotel_code });
            return res;
        });
    }
    // update role
    updateSingleRole(id, body, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("role AS r")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(body)
                .where({ id })
                .andWhere({ hotel_code });
            return res;
        });
    }
    // get role by name
    getRoleByName(name, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("role")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere(function () {
                if (name) {
                    this.where("name", "like", `${name}%`);
                }
            });
            return res;
        });
    }
    // get admins role permission
    getAdminRolePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email } = payload;
            console.log({ id });
            return yield this.db("admin_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .where(function () {
                if (id) {
                    this.where({ id });
                }
                else {
                    this.where({ email });
                }
            });
        });
    }
    // insert user admin
    insertUserAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
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
    // get admin by email
    getAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin AS ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.email", "ua.password", "ua.name", "ua.avatar", "ua.phone", "ua.status", "r.id As roleId", "r.name As roleName", "ua.created_at")
                .leftJoin("role AS r", "ua.role", "r.id")
                .where({ email });
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
    // get admin by id
    getAdminById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin AS ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.email", "ua.password", "ua.name", "ua.avatar", "ua.phone", "ua.status", "r.id As roleId", "r.name As roleName", "ua.created_at")
                .leftJoin("role AS r", "ua.role", "r.id")
                .where("ua.id", id);
        });
    }
}
exports.default = RAdministrationModel;
//# sourceMappingURL=rAdministration.model.js.map