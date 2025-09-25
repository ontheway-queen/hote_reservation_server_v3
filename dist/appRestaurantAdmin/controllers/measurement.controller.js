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
const measurement_service_1 = __importDefault(require("../services/measurement.service"));
const measurement_validator_1 = __importDefault(require("../utils/validator/measurement.validator"));
class RestaurantMeasurementController extends abstract_controller_1.default {
    constructor() {
        super();
        this.validator = new measurement_validator_1.default();
        this.service = new measurement_service_1.default();
        this.createMeasurement = this.asyncWrapper.wrap({ bodySchema: this.validator.createMeasurementsValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createMeasurement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getMeasurements = this.asyncWrapper.wrap({ querySchema: this.validator.getMenuCategoriesValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getMeasurements(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.updateMeasurement = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateMeasurementsValidator,
            paramSchema: this.commonValidator.singleParamStringValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.updateMeasurement(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteMeasurement = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamStringValidator(),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.deleteMeasurement(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = RestaurantMeasurementController;
//# sourceMappingURL=measurement.controller.js.map