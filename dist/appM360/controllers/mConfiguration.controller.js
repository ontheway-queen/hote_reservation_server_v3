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
const mConfiguration_service_1 = __importDefault(require("../services/mConfiguration.service"));
const mConfiguration_validator_1 = __importDefault(require("../utlis/validator/mConfiguration.validator"));
class MConfigurationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new mConfiguration_service_1.default();
        this.validator = new mConfiguration_validator_1.default();
        this.getAllAccomodation = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAccomodation(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleAccomodation = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getSingleAccomodation(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllCity = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getAllCity(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.insertCity = this.asyncWrapper.wrap({
            bodySchema: this.validator.insertCityValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.insertCity(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllCountry = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getAllCountry(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.createPermissionGroup = this.asyncWrapper.wrap({ bodySchema: this.validator.createPermissionGroupValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.createPermissionGroup(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        // get permission group
        this.getPermissionGroup = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.getPermissionGroup(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        // create permission
        this.createPermission = this.asyncWrapper.wrap({ bodySchema: this.validator.createPermissionValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.createPermission(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        // get single hotel permission
        this.getSingleHotelPermission = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getSingleHotelPermission(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        // update single hotel permission
        this.updateSingleHotelPermission = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
            bodySchema: this.validator.updatePermissionValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.updateSingleHotelPermission(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        // get all permission
        this.getAllPermission = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.getAllPermission(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        this.createAmenitiesHead = this.asyncWrapper.wrap({ bodySchema: this.validator.createAmenitiesHeadValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.createAmenitiesHead(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAmenitiesHead = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAmenitiesQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.getAllAmenitiesHead(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAmenitiesHead = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateAmenitiesHeadValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.updateAmenitiesHead(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
        this.createAmenities = this.asyncWrapper.wrap({ bodySchema: this.validator.createAmenitiesValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.createAmenities(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAmenities = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAmenitiesQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _r = yield this.service.getAllAmenities(req), { code } = _r, data = __rest(_r, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAmenities = this.asyncWrapper.wrap({ bodySchema: this.validator.UpdateAmenitiesValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _s = yield this.service.updateAmenities(req), { code } = _s, data = __rest(_s, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteAmenities = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _t = yield this.service.deleteAmenities(req), { code } = _t, data = __rest(_t, ["code"]);
            res.status(code).json(data);
        }));
        this.createResPermissionGroup = this.asyncWrapper.wrap({ bodySchema: this.validator.createPermissionGroupValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _u = yield this.service.createResPermissionGroup(req), { code } = _u, data = __rest(_u, ["code"]);
            res.status(code).json(data);
        }));
        // get permission group
        this.getResPermissionGroup = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _v = yield this.service.getResPermissionGroup(req), { code } = _v, data = __rest(_v, ["code"]);
            res.status(code).json(data);
        }));
        this.createResPermission = this.asyncWrapper.wrap({ bodySchema: this.validator.createPermissionValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _w = yield this.service.createResPermission(req), { code } = _w, data = __rest(_w, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleResPermission = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _x = yield this.service.getSingleResPermission(req), { code } = _x, data = __rest(_x, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSingleResPermission = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator("hotel_code"),
            bodySchema: this.validator.updatePermissionValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _y = yield this.service.updateSingleResPermission(req), { code } = _y, data = __rest(_y, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllResPermission = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _z = yield this.service.getAllResPermission(req), { code } = _z, data = __rest(_z, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = MConfigurationController;
//# sourceMappingURL=mConfiguration.controller.js.map