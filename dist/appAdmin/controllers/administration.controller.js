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
const administration_service_1 = __importDefault(require("../services/administration.service"));
const administration_validator_1 = __importDefault(require("../utlis/validator/administration.validator"));
class AdministrationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new administration_service_1.default();
        this.validator = new administration_validator_1.default();
        // get all permission
        this.getAllPermission = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllPermission(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // create role
        this.createRole = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.createRole(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        // get role
        this.getAllRole = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getAllRole(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleRole = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getSingleRole(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSingleRole = this.asyncWrapper.wrap({ bodySchema: this.validator.updateRolePermissions }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.updateSingleRole(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        // create admin
        this.createAdmin = this.asyncWrapper.wrap({
            bodySchema: this.validator.createAdmin,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.createAdmin(req), { code } = _f, data = __rest(_f, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        // update admin
        this.updateAdmin = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.updateAdmin(req), { code } = _g, data = __rest(_g, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        // get all admin
        this.getAllAdmin = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.getAllAdmin(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleAdmin = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getSingleAdmin(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdministrationController;
//# sourceMappingURL=administration.controller.js.map