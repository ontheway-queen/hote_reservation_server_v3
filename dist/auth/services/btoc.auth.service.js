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
class BtocUserAuthService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // registration
    registration(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const _a = req.body, { email, password } = _a, rest = __rest(_a, ["email", "password"]);
            const files = req.upFiles;
            const model = this.Model.btocUserModel();
            const isUserExists = yield model.checkUser({ email });
            if (isUserExists) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "An account with this email already exists. Please use a different email address and try again.",
                };
            }
            const hashedPassword = yield lib_1.default.hashPass(password);
            let photoUrl = null;
            if (files && files.length > 0) {
                photoUrl = files[0] || null;
            }
            const newUserData = Object.assign({ email,
                hotel_code, password: hashedPassword, photo: photoUrl }, rest);
            const createdUser = yield model.createUser(newUserData);
            const tokenPayload = {
                id: createdUser[0].id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                status: "active",
                date_of_birth: req.body.date_of_birth,
                gender: req.body.gender,
                type: "btoc_user",
            };
            const token = lib_1.default.createToken(tokenPayload, config_1.default.JWT_SECRET_H_USER, "24h");
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "User registration successful",
                token,
                data: {
                    id: createdUser[0].id,
                    email: createdUser[0].email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    phone: req.body.phone,
                    status: "active",
                    date_of_birth: req.body.date_of_birth,
                    gender: req.body.gender,
                },
            };
        });
    }
    // Login
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const model = this.Model.btocUserModel();
            const user = yield model.getSingleUser({ email });
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
            console.log({ user });
            const isPasswordValid = yield lib_1.default.compare(password, hashPass);
            if (!isPasswordValid) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: "Wrong password.",
                };
            }
            const tokenPayload = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                date_of_birth: user.date_of_birth,
                gender: user.status,
                type: "btoc_user",
            };
            const token = lib_1.default.createToken(tokenPayload, config_1.default.JWT_SECRET_H_USER, "24h");
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
            const { id, hotel_code } = req.btoc_user;
            console.log({ btoc: req.btoc_user });
            const reservationModel = this.Model.btocUserModel();
            const data = yield reservationModel.getSingleUser({ id });
            console.log({ data });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { password } = data, rest = __rest(data, ["password"]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign({}, rest),
            };
        });
    }
    // forget
    forgetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email, password } = req.body;
            const tokenVerify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_H_USER);
            if (!tokenVerify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verifyEmail, type } = tokenVerify;
            if (email === verifyEmail && type === constants_1.OTP_TYPE_FORGET_BTOC_USER) {
                const hashPass = yield lib_1.default.hashPass(password);
                const model = this.Model.btocUserModel();
                yield model.updateProfile({
                    payload: { password: hashPass },
                    email,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
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
exports.default = BtocUserAuthService;
//# sourceMappingURL=btoc.auth.service.js.map