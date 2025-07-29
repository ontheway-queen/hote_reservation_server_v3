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
class HotelAdminAuthService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // login
    login({ email, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.rAdministrationModel();
            const checkUser = yield model.getSingleAdmin({ email });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            const { password: hashPass, id, status, hotel_status, hotel_contact_details } = checkUser, rest = __rest(checkUser, ["password", "id", "status", "hotel_status", "hotel_contact_details"]);
            if (hotel_status == "disabled") {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Your hotel account has been disabled. Please contact support",
                };
            }
            else if (hotel_status == "expired") {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Your hotel account has been expired",
                };
            }
            if (!status) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Your credential has been deactivated",
                };
            }
            const checkPass = yield lib_1.default.compare(password, hashPass);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            const token = lib_1.default.createToken(Object.assign(Object.assign({ status }, rest), { id, type: "admin" }), config_1.default.JWT_SECRET_HOTEL_ADMIN, "24h");
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: Object.assign(Object.assign({ id }, rest), { status,
                    hotel_contact_details }),
                token,
            };
        });
    }
    // get profile
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = req.hotel_admin;
            const reservationModel = this.Model.rAdministrationModel();
            const data = yield reservationModel.getSingleAdmin({ id });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { password } = data, rest = __rest(data, ["password"]);
            let singleRolePermissions;
            if (data.role_id) {
                singleRolePermissions = yield reservationModel.getSingleRoleByView({
                    id: data.role_id,
                    hotel_code,
                });
            }
            const output_data = [];
            const { permissions } = singleRolePermissions || {};
            if (permissions === null || permissions === void 0 ? void 0 : permissions.length) {
                for (const perm of permissions) {
                    // Find or create group
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
                data: Object.assign(Object.assign({}, rest), { permissions: output_data }),
            };
        });
    }
    // update profile
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.hotel_admin;
            const model = this.Model.rAdministrationModel();
            const checkAdmin = yield model.getSingleAdmin({
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
            const { email } = checkAdmin;
            yield model.updateAdmin(req.body, { email });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Profile updated successfully",
            };
        });
    }
    // forget
    forgetService({ token, email, password, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenVerify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_HOTEL_ADMIN);
            if (!tokenVerify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verifyEmail, type } = tokenVerify;
            if (email === verifyEmail && type === constants_1.OTP_TYPE_FORGET_HOTEL_ADMIN) {
                const hashPass = yield lib_1.default.hashPass(password);
                const adminModel = this.Model.rAdministrationModel();
                yield adminModel.updateAdmin({ password: hashPass }, { email });
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
exports.default = HotelAdminAuthService;
//# sourceMappingURL=auth.hotel-admin.service.js.map