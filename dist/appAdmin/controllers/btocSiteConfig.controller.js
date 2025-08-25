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
exports.B2CSiteConfigController = void 0;
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const B2CSubSiteConfigService_1 = require("../services/B2CSubSiteConfigService");
const B2CSubSiteConfigValidator_1 = require("../utlis/validator/B2CSubSiteConfigValidator");
class B2CSiteConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new B2CSubSiteConfigService_1.B2CSubSiteConfigService();
        this.validator = new B2CSubSiteConfigValidator_1.B2CSubSiteConfigValidator();
        this.updateSiteConfig = this.asyncWrapper.wrap({ bodySchema: this.validator.updateSiteConfig }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateSiteConfig(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getSiteConfigData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getSiteConfigData(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getAboutUsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getAboutUsData(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAboutUsData = this.asyncWrapper.wrap({ bodySchema: this.validator.updateAboutUs }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.updateAboutUsData(req), { code } = _d, data = __rest(_d, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getContactUsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getContactUsData(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.updateContactUsData = this.asyncWrapper.wrap({ bodySchema: this.validator.updateContactUs }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.updateContactUsData(req), { code } = _f, data = __rest(_f, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getPrivacyPolicyData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.getPrivacyPolicyData(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.updatePrivacyPolicyData = this.asyncWrapper.wrap({ bodySchema: this.validator.updatePrivacyPolicy }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.updatePrivacyPolicyData(req), { code } = _h, data = __rest(_h, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getTermsAndConditionsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getTermsAndConditionsData(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.updateTermsAndConditions = this.asyncWrapper.wrap({ bodySchema: this.validator.updateTermsAndConditions }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.updateTermsAndConditions(req), { code } = _k, data = __rest(_k, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getSocialLinks = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.getSocialLinks(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteSocialLinks = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.deleteSocialLinks(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        this.createSocialLinks = this.asyncWrapper.wrap({ bodySchema: this.validator.createSocialLinks }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.createSocialLinks(req), { code } = _o, data = __rest(_o, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateSocialLinks = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.updateSocialLinks,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.updateSocialLinks(req), { code } = _p, data = __rest(_p, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getPopUpBanner = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.getPopUpBanner(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
        this.upSertPopUpBanner = this.asyncWrapper.wrap({
            bodySchema: this.validator.upSertPopUpBanner,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _r = yield this.service.upSertPopUpBanner(req), { code } = _r, data = __rest(_r, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
    }
}
exports.B2CSiteConfigController = B2CSiteConfigController;
//# sourceMappingURL=btocSiteConfig.controller.js.map