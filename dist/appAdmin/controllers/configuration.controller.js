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
const configuration_service_1 = __importDefault(require("../services/configuration.service"));
class ConfigurationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new configuration_service_1.default();
        // ======================= Shift ======================= //
        this.createShift = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createShift(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllShifts = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAllShifts(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleShift = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getSingleShift(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.updateShift = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.updateShift(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteShift = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.deleteShift(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        // ======================= Allowances ======================= //
        this.createAllowances = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.createAllowances(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAllowances = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.getAllAllowances(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleAllowance = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.getSingleAllowance(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAllowance = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.updateAllowance(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteAllowance = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.deleteAllowance(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        // ======================= Deductions ======================= //
        this.createDeductions = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.createDeductions(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllDeductions = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.getAllDeductions(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleDeduction = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.getSingleDeduction(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        this.updateDeduction = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.updateDeduction(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteDeduction = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.deleteDeduction(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = ConfigurationController;
//# sourceMappingURL=configuration.controller.js.map