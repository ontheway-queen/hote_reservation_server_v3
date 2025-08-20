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
exports.SettingRootController = void 0;
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const setting_root_service_1 = require("../services/setting.root.service");
const setting_validator_1 = __importDefault(require("../utlis/validator/setting.validator"));
class SettingRootController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new setting_root_service_1.SettingRootService();
        this.validator = new setting_validator_1.default();
        this.insertAccomodation = this.asyncWrapper.wrap({ bodySchema: this.validator.insertAccomodationValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertAccomodation(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAccomodation = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAccomodation(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAccomodation = this.asyncWrapper.wrap({ bodySchema: this.validator.updateAccomodationValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.updateAccomodation(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.insertCancellationPolicy = this.asyncWrapper.wrap({ bodySchema: this.validator.insertCancellationPolicyValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.insertCancellationPolicy(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllCancellationPolicy = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getAllCancellationPolicy(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleCancellationPolicy = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.getSingleCancellationPolicy(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.updateCancellationPolicy = this.asyncWrapper.wrap({ bodySchema: this.validator.updateCancellationPolicyValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.updateCancellationPolicy(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllMealPlan = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.getAllMealPlan(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllSources = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getAllSources(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.getChildAgePolicies = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.getChildAgePolicies(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.SettingRootController = SettingRootController;
//# sourceMappingURL=setting.root.controller.js.map