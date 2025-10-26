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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const adminCredsTemplate_1 = require("../../templates/adminCredsTemplate");
class ResAdministrationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = req.body, { password } = _a, rest = __rest(_a, ["password"]);
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const administrationModel = this.restaurantModel.restaurantAdminModel();
            const check = yield administrationModel.getSingleAdmin({
                email: req.body.email,
            });
            if (check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Email already exist",
                };
            }
            const files = req.files || [];
            rest["password"] = yield lib_1.default.hashPass(password);
            if (files.length) {
                rest["avatar"] = files[0].filename;
            }
            // check if role exist
            const checkRole = yield administrationModel.getSingleRoleByView({
                id: parseInt(req.body.role_id),
                hotel_code,
            });
            if (!checkRole) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Role not found",
                };
            }
            const res = yield administrationModel.createAdmin(Object.assign(Object.assign({}, rest), { restaurant_id,
                hotel_code }));
            // send email
            yield lib_1.default.sendEmail(req.body.email, "Your panel access has been successfully created", (0, adminCredsTemplate_1.newAdminUserAccountTemp)(req.body.email, req.body.password, req.body.name));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getAllAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const { limit, skip, status, owner, search } = req.query;
            const { data, total } = yield this.restaurantModel
                .restaurantAdminModel()
                .getAllAdmin({
                hotel_code,
                limit: Number(limit),
                skip: Number(skip),
                status: status,
                owner: owner,
                search: search,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.restaurant_admin;
            const data = yield this.restaurantModel
                .restaurantAdminModel()
                .getSingleAdmin({
                id: parseInt(id),
                hotel_code,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminModel = this.restaurantModel.restaurantAdminModel();
            const check = yield adminModel.getSingleAdmin({
                id: parseInt(req.params.id),
            });
            if (!check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const files = req.files || [];
            req.body["photo"] = (files === null || files === void 0 ? void 0 : files.length) && files[0].filename;
            yield adminModel.updateAdmin(req.body, {
                id: parseInt(req.params.id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully Updated",
            };
        });
    }
    // get all permission
    getAllPermission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantAdminModel();
            const { permissions } = yield model.getResPermissionViewByHotel({
                hotel_code,
            });
            const groupedPermissions = {};
            permissions.forEach((entry) => {
                const permission_group_id = entry.permission_group_id;
                const permission = {
                    permission_id: entry.permission_id,
                    permission_name: entry.permission_name,
                    res_permission_id: entry.res_permission_id,
                };
                if (!groupedPermissions[permission_group_id]) {
                    groupedPermissions[permission_group_id] = {
                        permission_group_id: permission_group_id,
                        permissionGroupName: entry.permission_group_name,
                        permissions: [permission],
                    };
                }
                else {
                    groupedPermissions[permission_group_id].permissions.push(permission);
                }
            });
            const result = Object.values(groupedPermissions);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: result,
            };
        });
    }
    // create role
    createRole(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { role_name, permissions } = req.body;
                const { id, hotel_code, restaurant_id } = req.restaurant_admin;
                const model = this.restaurantModel.restaurantAdminModel(trx);
                // check role
                const checkRole = yield model.getRoleByName(role_name, hotel_code);
                if (checkRole.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Already exist",
                    };
                }
                // insert role
                const res = yield model.createRole({
                    name: role_name,
                    hotel_code,
                    init_role: false,
                    created_by: id,
                    res_id: restaurant_id,
                });
                const permissionIds = permissions.map((item) => item.res_permission_id);
                const uniquePermissionIds = [...new Set(permissionIds)];
                // get all permission
                const checkAllPermission = yield model.getHotelAllResPermissionByHotel({
                    ids: permissionIds,
                    hotel_code,
                });
                if (checkAllPermission.length != uniquePermissionIds.length) {
                    // return {
                    //   success: false,
                    //   code: this.StatusCode.HTTP_BAD_REQUEST,
                    //   message: "Permission ids are invalid",
                    // };
                    throw "Permission ids are invalid";
                }
                const rolePermissionPayload = [];
                for (let i = 0; i < permissions.length; i++) {
                    rolePermissionPayload.push(Object.assign(Object.assign({ hotel_code, role_id: res[0].id }, permissions[i]), { res_permission_id: permissions[i].res_permission_id, created_by: id }));
                }
                // insert role permission
                yield model.insertInRolePermission(rolePermissionPayload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllRole(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this.restaurantModel
                .restaurantAdminModel()
                .getAllRole({
                hotel_code: req.restaurant_admin.hotel_code,
                limit: Number(req.query.limit),
                skip: Number(req.query.skip),
                search: req.query.search,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleRole(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.restaurantModel.restaurantAdminModel();
            const data = yield model.getSingleRoleByView({
                id: parseInt(id),
                hotel_code: req.restaurant_admin.hotel_code,
            });
            const { permissions } = data, rest = __rest(data, ["permissions"]);
            const output_data = [];
            permissions === null || permissions === void 0 ? void 0 : permissions.forEach((entry) => {
                const permissionGroupId = entry.permission_group_id;
                const permission = {
                    permission_id: entry.permission_id,
                    res_permission_id: entry.res_permission_id,
                    permission_name: entry.permission_name,
                    read: entry.read,
                    write: entry.write,
                    update: entry.update,
                    delete: entry.delete,
                };
                const existingGroup = output_data.find((group) => group.permission_group_id === permissionGroupId);
                if (existingGroup) {
                    existingGroup.subModules.push(permission);
                }
                else {
                    output_data.push({
                        permissionGroupId: permissionGroupId,
                        permissionGroupName: entry.permission_group_name,
                        subModules: [permission],
                    });
                }
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, rest), { permissions: output_data }),
            };
        });
    }
    updateSingleRole(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: role_id } = req.params;
            const { id: admin_id, hotel_code } = req.restaurant_admin;
            const { role_name, update_permissions, deleted, status, } = req.body;
            const updated_permissions = [...new Set(update_permissions)];
            console.log("firstly", updated_permissions);
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.restaurantModel.restaurantAdminModel(trx);
                if (role_name) {
                    // check role
                    const checkRole = yield model.getSingleRoleByView({
                        id: parseInt(role_id),
                        hotel_code,
                    });
                    if (!checkRole) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "role not found",
                        };
                    }
                    yield model.updateSingleRole(parseInt(role_id), {
                        name: role_name,
                    }, hotel_code);
                }
                // ================== new permission added step ================= //
                if (updated_permissions.length) {
                    const updatePermissionIds = updated_permissions.map((item) => item.res_permission_id);
                    const uniquePermissionIds = [...new Set(updatePermissionIds)];
                    // get all permission
                    const checkAllPermission = yield model.getHotelAllResPermissionByHotel({
                        ids: uniquePermissionIds,
                        hotel_code,
                    });
                    if (checkAllPermission.length != uniquePermissionIds.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Permission ids are invalid",
                        };
                    }
                    // check  if h_permission_id already exist in role permission
                    const existingPermissions = yield model.getRolePermissionByRole({
                        hotel_code,
                        role_id: parseInt(role_id),
                        h_permission_ids: uniquePermissionIds,
                    });
                    const existingPermissionIds = existingPermissions.map((item) => item.h_permission_id);
                    // filter out not already existing permission
                    const newPermission = uniquePermissionIds.filter((id) => !existingPermissionIds.includes(id));
                    const newPermissionPayload = [];
                    // new permission payload
                    if (newPermission.length) {
                        for (let i = 0; i < updated_permissions.length; i++) {
                            if (newPermission.includes(updated_permissions[i].res_permission_id)) {
                                newPermissionPayload.push(Object.assign(Object.assign({ hotel_code, role_id: parseInt(role_id) }, updated_permissions[i]), { res_permission_id: updated_permissions[i].res_permission_id, created_by: admin_id }));
                            }
                        }
                    }
                    // insert role permission
                    newPermissionPayload.length &&
                        (yield model.insertInRolePermission(newPermissionPayload));
                    const existingRolePermissionPayload = [];
                    if (existingPermissionIds.length) {
                        for (let i = 0; i < updated_permissions.length; i++) {
                            if (existingPermissionIds.includes(updated_permissions[i].res_permission_id)) {
                                existingRolePermissionPayload.push({
                                    res_permission_id: updated_permissions[i].res_permission_id,
                                    read: updated_permissions[i].read,
                                    write: updated_permissions[i].write,
                                    update: updated_permissions[i].update,
                                    delete: updated_permissions[i].delete,
                                });
                            }
                        }
                        yield Promise.all(existingRolePermissionPayload.map((item) => __awaiter(this, void 0, void 0, function* () {
                            yield model.updateRolePermission({
                                read: item.read,
                                write: item.write,
                                update: item.update,
                                delete: item.delete,
                                updated_by: admin_id,
                            }, Number(item.res_permission_id), Number(role_id), hotel_code);
                        })));
                    }
                }
                // update role
                if (typeof status === "boolean") {
                    yield model.updateSingleRole(Number(role_id), { status }, hotel_code);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Role updated successfully",
                };
            }));
        });
    }
}
exports.default = ResAdministrationService;
//# sourceMappingURL=res.administration.service.js.map