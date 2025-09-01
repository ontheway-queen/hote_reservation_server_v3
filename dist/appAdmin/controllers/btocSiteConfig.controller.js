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
        this.getHeroBGContent = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _s = yield this.service.getHeroBGContent(req), { code } = _s, data = __rest(_s, ["code"]);
            res.status(code).json(data);
        }));
        this.createHeroBGContent = this.asyncWrapper.wrap({ bodySchema: this.validator.createHeroBGContent }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _t = yield this.service.createHeroBGContent(req), { code } = _t, data = __rest(_t, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateHeroBGContent = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.updateHeroBGContent,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _u = yield this.service.updateHeroBGContent(req), { code } = _u, data = __rest(_u, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deleteHeroBGContent = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _v = yield this.service.deleteHeroBGContent(req), { code } = _v, data = __rest(_v, ["code"]);
            res.status(code).json(data);
        }));
        // =========================== FAQ =========================== //
        this.getAllFaqHeads = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _w = yield this.service.getAllFaqHeads(req), { code } = _w, data = __rest(_w, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.createFaqHead = this.asyncWrapper.wrap({ bodySchema: this.validator.createFaqHead }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _x = yield this.service.createFaqHead(req), { code } = _x, data = __rest(_x, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateFaqHead = this.asyncWrapper.wrap({ bodySchema: this.validator.createFaqHead }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _y = yield this.service.updateFaqHead(req), { code } = _y, data = __rest(_y, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.deleteFaqHead = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _z = yield this.service.deleteFaqHead(req), { code } = _z, data = __rest(_z, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getFaqsByHeadId = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _0 = yield this.service.getFaqsByHeadId(req), { code } = _0, data = __rest(_0, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.createFaq = this.asyncWrapper.wrap({ bodySchema: this.validator.createFaq }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _1 = yield this.service.createFaq(req), { code } = _1, data = __rest(_1, ["code"]);
            res.status(code).json(data);
        }));
        this.updateFaq = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateFaq,
            paramSchema: this.commonValidator.singleParamValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _2 = yield this.service.updateFaq(req), { code } = _2, data = __rest(_2, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteFaq = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _3 = yield this.service.deleteFaq(req), { code } = _3, data = __rest(_3, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAmenityHeads = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _4 = yield this.service.getAllAmenityHeads(req), { code } = _4, data = __rest(_4, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAmenities = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _5 = yield this.service.getAllAmenities(req), { code } = _5, data = __rest(_5, ["code"]);
            res.status(code).json(data);
        }));
        this.addHotelAmenities = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _6 = yield this.service.addHotelAmenities(req), { code } = _6, data = __rest(_6, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getAllHotelAmenities = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _7 = yield this.service.getAllHotelAmenities(req), { code } = _7, data = __rest(_7, ["code"]);
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