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
const adminBtocHandler_validator_1 = __importDefault(require("../utlis/validator/adminBtocHandler.validator"));
const adminBtocHandler_service_1 = __importDefault(require("../services/adminBtocHandler.service"));
class AdminBtocHandlerController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new adminBtocHandler_service_1.default();
        this.validator = new adminBtocHandler_validator_1.default();
        this.getSiteConfiguration = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSiteConfiguration(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getPopUpBannerConfiguration = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getPopUpBannerConfiguration(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getHeroBgContent = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getHeroBgContent(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getHotDeals = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getHotDeals(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getSocialLinks = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getSocialLinks(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.getPopularRoomTypes = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.getPopularRoomTypes(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSiteConfig = this.asyncWrapper.wrap({ bodySchema: this.validator.updateBtocSiteConfig }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.updateSiteConfig(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.updatePopUpBanner = this.asyncWrapper.wrap({ bodySchema: this.validator.updatePopUpBanner }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.updatePopUpBanner(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHeroBgContent = this.asyncWrapper.wrap({ bodySchema: this.validator.updateHeroBgContent }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.updateHeroBgContent(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHotDeals = this.asyncWrapper.wrap({ bodySchema: this.validator.updateHotDeals }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.updateHotDeals(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSocialLinks = this.asyncWrapper.wrap({ bodySchema: this.validator.updateSocialLinks }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.updateSocialLinks(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        this.updatePopularRoomTypes = this.asyncWrapper.wrap({ bodySchema: this.validator.updatePopularRoomTypes }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.updatePopularRoomTypes(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        // ======================== Service Content ================================ //
        this.createHotelServiceContent = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.createHotelServiceContent(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHotelServiceContent = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.updateHotelServiceContent(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
        this.getHotelContentService = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.getHotelContentService(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
        // ======================== Services ================================ //
        this.createHotelService = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _r = yield this.service.createHotelService(req), { code } = _r, data = __rest(_r, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllServices = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _s = yield this.service.getAllServices(req), { code } = _s, data = __rest(_s, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleService = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _t = yield this.service.getSingleService(req), { code } = _t, data = __rest(_t, ["code"]);
            res.status(code).json(data);
        }));
        this.updateService = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _u = yield this.service.updateService(req), { code } = _u, data = __rest(_u, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteService = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _v = yield this.service.deleteService(req), { code } = _v, data = __rest(_v, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminBtocHandlerController;
//# sourceMappingURL=adminBtocHandler.controller.js.map