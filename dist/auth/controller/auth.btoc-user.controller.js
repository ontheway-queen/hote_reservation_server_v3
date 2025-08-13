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
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const auth_btoc_user_service_1 = __importDefault(require("../services/auth.btoc-user.service"));
const auth_btoc_user_validator_1 = require("../utils/validator/auth.btoc-user.validator");
const commonServices_1 = __importDefault(require("../../common/services/commonServices"));
class BtocUserAuthController extends abstract_controller_1.default {
    constructor() {
        super();
        this.btocUserAuthService = new auth_btoc_user_service_1.default();
        this.btocUserAuthValidator = new auth_btoc_user_validator_1.BtocUserAuthValidator();
        this.commonService = new commonServices_1.default();
        // registration
        this.registration = this.asyncWrapper.wrap({ bodySchema: this.btocUserAuthValidator.registrationValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.btocUserAuthService.registration(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // login
        this.login = this.asyncWrapper.wrap({ bodySchema: this.btocUserAuthValidator.loginValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.btocUserAuthService.login(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        // forget password
        this.forgetPassword = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.forgetPasswordValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.btocUserAuthService.forgetPassword(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        // change password
        this.changePassword = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.changePasswordValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { old_password, new_password } = req.body;
            const { user_id } = req.btoc_user;
            const table = "users";
            const passField = "password";
            const userIdField = "id";
            const schema = "btoc";
            const _d = yield this.commonService.userPasswordVerify({
                table,
                oldPassword: old_password,
                passField,
                userId: user_id,
                userIdField,
                schema,
            }), { code } = _d, data = __rest(_d, ["code"]);
            if (data.success) {
                const _e = yield this.commonService.changePassword({
                    password: new_password,
                    table,
                    passField,
                    userId: user_id,
                    userIdField,
                    schema,
                }), { code } = _e, data = __rest(_e, ["code"]);
                res.status(code).json(data);
            }
            else {
                res.status(code).json(data);
            }
        }));
    }
}
exports.default = BtocUserAuthController;
//# sourceMappingURL=auth.btoc-user.controller.js.map