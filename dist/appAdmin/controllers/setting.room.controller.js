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
const setting_room_service_1 = __importDefault(require("../services/setting.room.service"));
const setting_validator_1 = __importDefault(require("../utlis/validator/setting.validator"));
class RoomSettingController extends abstract_controller_1.default {
    constructor() {
        super();
        this.roomSettingService = new setting_room_service_1.default();
        this.settingValidator = new setting_validator_1.default();
        //=================== Room Type Controller ======================//
        // Create Room Type
        this.createRoomType = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.createRoomTypeValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.roomSettingService.createRoomType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Room Type
        this.getAllRoomType = this.asyncWrapper.wrap({ querySchema: this.settingValidator.getAllRoomTypeQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.roomSettingService.getAllRoomType(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        // single Room Type
        this.getSingleRoomType = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.roomSettingService.getSingleRoomType(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        // Update Room Type
        this.updateRoomType = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.updateRoomTypeValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.roomSettingService.updateRoomType(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        // Delete Room Type
        this.deleteRoomType = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.roomSettingService.deleteRoomType(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Room Type Categories
        this.getAllRoomTypeAmenities = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.roomSettingService.getAllRoomTypeAmenities(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Room Type Categories Controller ======================//
        // Create Room Type Categories
        this.createRoomTypeCategories = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.createRoomTypeCategoriesValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.roomSettingService.createRoomTypeCategories(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Room Type Categories
        this.getAllRoomTypeCategories = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.roomSettingService.getAllRoomTypeCategories(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        // Update Room Type Categories
        this.updateRoomTypeCategories = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.UpdateRoomTypeCategoriesValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.roomSettingService.updateRoomTypeCategories(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        // Delete Room Type
        this.deleteRoomTypeCategories = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.roomSettingService.deleteRoomTypeCategories(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        //=================== Bed Type Controller ======================//
        // Create Bed Type
        this.createBedType = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.createBedTypeValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.roomSettingService.createBedType(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        // Get All Bed Type
        this.getAllBedType = this.asyncWrapper.wrap({ querySchema: this.settingValidator.getAllBedTypeQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.roomSettingService.getAllBedType(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        // Update Bed Type
        this.updateBedType = this.asyncWrapper.wrap({ bodySchema: this.settingValidator.UpdateBedTypeValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.roomSettingService.updateBedType(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        // Delete Bed Type
        this.deleteBedType = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.roomSettingService.deleteBedType(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = RoomSettingController;
//# sourceMappingURL=setting.room.controller.js.map