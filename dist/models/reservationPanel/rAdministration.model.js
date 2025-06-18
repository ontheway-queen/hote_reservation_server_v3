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
    rolePermissionGroup(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(body);
        });
    }
    getRolePermissionGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permission_group")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name");
        });
    }
    updateRole({ name, status }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .update({ name, status })
                .where({ id });
        });
    }
    // update role permission
    updateRolePermission(payload, permission_id, role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("role_id", role_id)
                .andWhere("permission_id", permission_id);
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
    permissionsList(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("permissions as per")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("per.id as permission_id", "per.name as permission_name", "per.create_date")
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy("per.id", "asc")
                .where((qb) => {
                if (params.name) {
                    qb.where("per.name", params.name);
                }
            });
            let count = [];
            count = yield this.db("permissions")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where((qb) => {
                if (params.name) {
                    qb.where("name", params.name);
                }
            });
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // create role permission
    createRolePermission(insertObj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
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
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    // get role
    roleList({ hotel_code, limit, skip, search, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("roles as rl")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rl.id as role_id", "rl.name as role_name", "ua.name as created_by", "rl.created_at", "rl.init_role")
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
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // get single role
    getSingleRole({ id, name, permission_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles as rol")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rol.id as role_id", "rol.name as role_name", "rol.status", "rol.init_role", this.db.raw(`
      case when exists (
        select 1
        from ${this.RESERVATION_SCHEMA}.role_permissions rp
        where rp.role_id = rol.id
      ) then (
        select json_agg(
          json_build_object(
            'permission_id', per.id,
            'permission_name', per.name,
            'read', rp.read,
            'write', rp.write,
            'update', rp.update,
            'delete', rp.delete
          )
                order by per.name asc
        )
        from ${this.RESERVATION_SCHEMA}.role_permissions rp
        left join ${this.RESERVATION_SCHEMA}.permissions per
        on rp.permission_id = per.id
        where rp.role_id = rol.id
        group by rp.role_id
      ) else '[]' end as permissions
    `))
                .where((qb) => {
                if (id) {
                    qb.where("rol.id", id);
                }
                qb.andWhere("rol.hotel_code", hotel_code);
                if (name) {
                    qb.where("rol.name", name);
                }
                if (permission_id) {
                    qb.andWhere("per.id", permission_id);
                }
            });
        });
    }
    // update role
    updateSingleRole(id, body, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("roles")
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
    // insert user admin
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleAdmin(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id } = where;
            return yield this.db("user_admin AS ua")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ua.id", "ua.email", "ua.hotel_code", "h.name as hotel_name", "ua.phone", "ua.password", "ua.photo", "ua.name", "ua.status", "r.id as role_id", "r.name as role_name", "ua.created_at", this.db.raw(`
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