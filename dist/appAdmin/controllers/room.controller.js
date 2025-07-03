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
const room_service_1 = __importDefault(require("../services/room.service"));
const Room_validator_1 = __importDefault(require("../utlis/validator/Room.validator"));
class RoomController extends abstract_controller_1.default {
    constructor() {
        super();
        this.roomService = new room_service_1.default();
        this.roomvalidator = new Room_validator_1.default();
        this.createroom = this.asyncWrapper.wrap({ bodySchema: this.roomvalidator.createRoomValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.roomService.createRoom(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getAllRoom = this.asyncWrapper.wrap({ querySchema: this.roomvalidator.getAllHotelRoomQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.roomService.getAllRoom(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllRoomByRoomStatus = this.asyncWrapper.wrap({
            querySchema: this.roomvalidator.getAllHotelRoomByRoomStatusQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.roomService.getAllRoomByRoomStatus(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllRoomByRoomTypes = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.roomService.getAllRoomByRoomTypes(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllAvailableRooms = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.roomService.getAllAvailableRooms(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHotelRoom = this.asyncWrapper.wrap({ bodySchema: this.roomvalidator.updateRoomValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _f = yield this.roomService.updateroom(req), { code } = _f, data = __rest(_f, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteHotelRoom = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator("room_id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _g = yield this.roomService.deleteHotelRoom(req), { code } = _g, data = __rest(_g, ["code"]);
            res.status(code).json(data);
        }));
        this.updateHotelRoomStatus = this.asyncWrapper.wrap({ bodySchema: this.roomvalidator.updateRoomStatusValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _h = yield this.roomService.updateRoomStatus(req), { code } = _h, data = __rest(_h, ["code"]);
            res.status(code).json(data);
        }));
        // get all rooms by room type
        this.getAllRoomByRoomType = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator("room_type_id"),
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _j = yield this.roomService.getAllRoomByRoomType(req), { code } = _j, data = __rest(_j, ["code"]);
            res.status(code).json(data);
        }));
        // get all occupied rooms using date
        this.getAllOccupiedRooms = this.asyncWrapper.wrap({ querySchema: this.roomvalidator.getAllOccupiedRoomsQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _k = yield this.roomService.getAllOccupiedRooms(req), { code } = _k, data = __rest(_k, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = RoomController;
//# sourceMappingURL=room.controller.js.map