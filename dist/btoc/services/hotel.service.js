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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../../appAdmin/utlis/library/helperFunction");
class BtocHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    searchAvailability(req) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ data: req.btoc_user });
            const { hotel_code } = req.btoc_user;
            const { check_in, check_out } = req.query;
            const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
            const getAllAvailableRooms = yield this.BtocModels.btocReservationModel().getAllRoomRatesBTOC({
                hotel_code,
                nights,
                checkin: checkin,
                checkout: checkout,
                rooms,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    total: getAllAvailableRooms.length,
                    no_of_nights: nights,
                    checkin,
                    checkout,
                    no_of_rooms: rooms.length,
                    data: getAllAvailableRooms,
                },
            };
        });
    }
    recheck(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { checkin, checkout, rooms, room_type_id, rate_plan_id } = req.body;
            const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
            const getAvailableRoom = yield this.BtocModels.btocReservationModel().recheck({
                hotel_code,
                nights,
                checkin: checkin,
                checkout: checkout,
                rooms,
                rate_plan_id,
                room_type_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    no_of_nights: nights,
                    checkin,
                    checkout,
                    no_of_rooms: rooms.length,
                    data: getAvailableRoom,
                },
            };
        });
    }
    booking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, checkin, checkout, room_type_id, rate_plan_id, rooms, guest_info, special_request, } = req.body;
                const totalRequested = rooms.length;
                const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
                const recheck = yield this.BtocModels.btocReservationModel().recheck({
                    hotel_code,
                    nights,
                    checkin: checkin,
                    checkout: checkout,
                    rooms,
                    rate_plan_id,
                    room_type_id,
                });
                if (!recheck) {
                    throw new Error("Room not available for booking");
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    guest: guest_info,
                    room_type: recheck.room_type_name,
                    rate_plan: recheck.rate.rate_plan_name,
                    total_price: recheck.rate.total_price,
                    checkin,
                    checkout,
                    rooms: rooms.length,
                    status: "CONFIRMED",
                };
            }));
        });
    }
}
exports.BtocHotelService = BtocHotelService;
//# sourceMappingURL=hotel.service.js.map