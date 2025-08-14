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
class BtocHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    searchAvailability(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.btoc_user;
            const { check_in, check_out } = req.query;
            const getAllAvailableRoomsWithType = yield this.Model.reservationModel().calendar({
                hotel_code,
                check_in: check_in,
                check_out: check_out,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getAllAvailableRoomsWithType,
            };
        });
    }
}
exports.BtocHotelService = BtocHotelService;
//# sourceMappingURL=hotel.service.js.map