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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class URoomBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create room booking
    createRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // get all room booking
    getAllRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_user;
            const { limit, skip, name, status, user_id } = req.query;
            const model = this.Model.clientModel();
            const { data, total } = yield model.getAllRoomBooking({
                limit: limit,
                skip: skip,
                name: name,
                hotel_code,
                status: status,
                user_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get single room booking
    getSingleRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_user;
            const data = yield this.Model.clientModel().getSingleRoomBooking(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
}
exports.default = URoomBookingService;
//# sourceMappingURL=booking.service.js.map