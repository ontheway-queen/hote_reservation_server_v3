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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const config_1 = __importDefault(require("../../config/config"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const constants_1 = require("../../utils/miscellaneous/constants");
class AuthHotelRestaurantAdminService extends abstract_service_1.default {
    constructor() {
        super();
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const model = this.restaurantModel.restaurantAdminModel();
            const user = yield model.getRestaurantAdmin({ email });
            if (!user) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            if (user.status !== "active") {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: `Your account is ${user.status}. Please contact support.`,
                };
            }
            const { password: hashPass, is_deleted } = user, rest = __rest(user, ["password", "is_deleted"]);
            const isPasswordValid = yield lib_1.default.compare(password, hashPass);
            if (!isPasswordValid) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            const tokenPayload = {
                id: user.id,
                hotel_code: user.hotel_code,
                restaurant_id: user.restaurant_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                type: "admin",
            };
            const token = lib_1.default.createToken(tokenPayload, config_1.default.JWT_SECRET_H_RESTURANT, "24h");
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully Logged In",
                data: rest,
                token,
            };
        });
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code, restaurant_id } = req.restaurant_admin;
            const restaurantAdminModel = this.restaurantModel.restaurantAdminModel();
            const data = yield restaurantAdminModel.getRestaurantAdminProfile({
                id,
                hotel_code,
                restaurant_id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const singleRolePermissions = yield restaurantAdminModel.getSingleRoleByView({
                id: data.role_id,
                hotel_code,
            });
            const output_data = [];
            const { permissions } = singleRolePermissions || {};
            if (permissions === null || permissions === void 0 ? void 0 : permissions.length) {
                for (const perm of permissions) {
                    let group = output_data.find((g) => g.permission_group_id === perm.permission_group_id);
                    if (!group) {
                        group = {
                            permission_group_id: perm.permission_group_id,
                            permission_group_name: perm.permission_group_name,
                            subModules: [],
                        };
                        output_data.push(group);
                    }
                    // Push permission submodule
                    group.subModules.push({
                        permission_id: perm.permission_id,
                        permission_name: perm.permission_name,
                        permissions: {
                            read: perm.read,
                            write: perm.write,
                            update: perm.update,
                            delete: perm.delete,
                        },
                    });
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { permissions: output_data }),
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = req.restaurant_admin;
            const body = req.body;
            console.log({ body });
            const model = this.restaurantModel.restaurantAdminModel();
            const checkAdmin = yield model.getRestaurantAdmin({
                id,
            });
            if (!checkAdmin) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const files = req.files || [];
            if (files.length) {
                req.body[files[0].fieldname] = files[0].filename;
            }
            if (body === null || body === void 0 ? void 0 : body.email) {
                const emailExists = yield model.getAllRestaurantAdminEmail({
                    email: body.email,
                    hotel_code,
                });
                if (emailExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Restaurant Admin's email already exists with this hotel.",
                    };
                }
            }
            yield model.updateRestaurantAdmin({ id, payload: body });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    changeAdminPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.restaurant_admin;
            const { old_password, new_password } = req.body;
            const model = this.restaurantModel.restaurantAdminModel();
            const checkAdmin = yield model.getRestaurantAdmin({
                id,
            });
            if (!checkAdmin) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const comparePassword = yield lib_1.default.compare(old_password, checkAdmin.password);
            if (!comparePassword) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: "Old password is not correct!",
                };
            }
            const hashPass = yield lib_1.default.hashPass(new_password);
            yield model.updateRestaurantAdmin({
                id,
                payload: { password: hashPass },
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    resetForgetPassword({ token, email, password, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenVerify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_H_RESTURANT);
            if (!tokenVerify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verifyEmail, type } = tokenVerify;
            if (email === verifyEmail && type === constants_1.OTP_TYPE_FORGET_RESTAURANT_ADMIN) {
                const hashPass = yield lib_1.default.hashPass(password);
                const adminModel = this.restaurantModel.restaurantAdminModel();
                yield adminModel.updateRestaurantAdmin({
                    email,
                    payload: { password: hashPass },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_FULFILLED,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
        });
    }
}
exports.default = AuthHotelRestaurantAdminService;
//# sourceMappingURL=auth.hotel-restaurant-admin.service.js.map