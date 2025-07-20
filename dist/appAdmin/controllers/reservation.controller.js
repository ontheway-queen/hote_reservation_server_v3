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
exports.ReservationController = void 0;
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const reservation_service_1 = __importDefault(require("../services/reservation.service"));
const reservation_validator_1 = require("../utlis/validator/reservation.validator");
class ReservationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new reservation_service_1.default();
        this.validator = new reservation_validator_1.ReservationValidator();
        this.calendar = this.asyncWrapper.wrap({
            querySchema: this.validator.getAvailableRoomsQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.calendar(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAvailableRoomsTypeWithAvailableRoomCount = this.asyncWrapper.wrap({
            querySchema: this.validator.getAvailableRoomsQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getAllAvailableRoomsTypeWithAvailableRoomCount(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAvailableRoomsTypeForEachDateAvailableRoom = this.asyncWrapper.wrap({
            querySchema: this.validator.getAvailableRoomsQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getAllAvailableRoomsTypeForEachDateAvailableRoom(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAvailableRoomsByRoomType = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            querySchema: this.validator.getAvailableRoomsQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.getAllAvailableRoomsByRoomType(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.createBooking = this.asyncWrapper.wrap({
            bodySchema: this.validator.createBookingValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.service.createBooking(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.createGroupBooking = this.asyncWrapper.wrap({
            bodySchema: this.validator.createGroupBookingValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.service.createGroupBooking(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllBooking = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.service.getAllBooking(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllIndividualBooking = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.service.getAllIndividualBooking(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllGroupBooking = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.service.getAllGroupBooking(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        this.getArrivalDepStayBookings = this.asyncWrapper.wrap({
            querySchema: this.validator.getAllBookingByBookingModeValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.service.getArrivalDepStayBookings(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _l = yield this.service.getSingleBooking(req), { code } = _l, data = __rest(_l, ["code"]);
            res.status(code).json(data);
        }));
        this.updateSingleBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.updateSingleBookingValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _m = yield this.service.updatePartialReservation(req), { code } = _m, data = __rest(_m, ["code"]);
            res.status(code).json(data);
        }));
        this.changeDatesOfBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.changeDatesOfBooking,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _o = yield this.service.changeDatesOfBooking(req), { code } = _o, data = __rest(_o, ["code"]);
            res.status(code).json(data);
        }));
        this.individualRoomDatesChangeOfBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.changeDatesOfBookingRoom,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _p = yield this.service.individualRoomDatesChangeOfBooking(req), { code } = _p, data = __rest(_p, ["code"]);
            res.status(code).json(data);
        }));
        this.checkIn = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _q = yield this.service.checkIn(req), { code } = _q, data = __rest(_q, ["code"]);
            res.status(code).json(data);
        }));
        this.individualRoomCheckIn = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.doubleParamValidator("id", "room_id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _r = yield this.service.individualRoomCheckIn(req), { code } = _r, data = __rest(_r, ["code"]);
            res.status(code).json(data);
        }));
        this.checkOut = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _s = yield this.service.checkOut(req), { code } = _s, data = __rest(_s, ["code"]);
            res.status(code).json(data);
        }));
        this.individualCheckOut = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.doubleParamValidator("id", "room_id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _t = yield this.service.individualCheckOut(req), { code } = _t, data = __rest(_t, ["code"]);
            res.status(code).json(data);
        }));
        this.updateReservationHoldStatus = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator(),
            bodySchema: this.validator.updateReservationHoldStatusValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _u = yield this.service.updateReservationHoldStatus(req), { code } = _u, data = __rest(_u, ["code"]);
            res.status(code).json(data);
        }));
        this.getFoliosbySingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _v = yield this.service.getFoliosbySingleBooking(req), { code } = _v, data = __rest(_v, ["code"]);
            res.status(code).json(data);
        }));
        this.getFoliosWithEntriesbySingleBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _w = yield this.service.getFoliosWithEntriesbySingleBooking(req), { code } = _w, data = __rest(_w, ["code"]);
            res.status(code).json(data);
        }));
        this.addPaymentByFolioID = this.asyncWrapper.wrap({
            bodySchema: this.validator.addPayment,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _x = yield this.service.addPaymentByFolioID(req), { code } = _x, data = __rest(_x, ["code"]);
            res.status(code).json(data);
        }));
        this.refundPaymentByFolioID = this.asyncWrapper.wrap({
            bodySchema: this.validator.addPayment,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _y = yield this.service.refundPaymentByFolioID(req), { code } = _y, data = __rest(_y, ["code"]);
            res.status(code).json(data);
        }));
        this.adjustAmountByFolioID = this.asyncWrapper.wrap({
            bodySchema: this.validator.adjustBalance,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _z = yield this.service.adjustAmountByFolioID(req), { code } = _z, data = __rest(_z, ["code"]);
            res.status(code).json(data);
        }));
        this.addItemByFolioID = this.asyncWrapper.wrap({
            bodySchema: this.validator.addItemByFolioID,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _0 = yield this.service.addItemByFolioID(req), { code } = _0, data = __rest(_0, ["code"]);
            res.status(code).json(data);
        }));
        this.getFolioEntriesbyFolioID = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _1 = yield this.service.getFolioEntriesbyFolioID(req), { code } = _1, data = __rest(_1, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.ReservationController = ReservationController;
//# sourceMappingURL=reservation.controller.js.map