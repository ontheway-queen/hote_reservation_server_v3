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
exports.BtocHotelController = void 0;
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const hotel_service_1 = require("../services/hotel.service");
const hotel_validator_1 = require("../utills/validators/hotel.validator");
class BtocHotelController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new hotel_service_1.BtocHotelService();
        this.validator = new hotel_validator_1.BtoHotelValidator();
        this.searchAvailability = this.asyncWrapper.wrap({ bodySchema: this.validator.hotelSearchValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.searchAvailability(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.recheck = this.asyncWrapper.wrap({ bodySchema: this.validator.recheckValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.recheck(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.booking = this.asyncWrapper.wrap({ bodySchema: this.validator.bookingValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.booking(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllBooking = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getAllBooking(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("ref_id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.getSingleBooking(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.cancelSingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("ref_id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.cancelSingleBooking(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.BtocHotelController = BtocHotelController;
//# sourceMappingURL=btoc.hotel.controller.js.map