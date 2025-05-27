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
exports.ClientRoomService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class ClientRoomService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get All Hotel Room
    getAllHotelRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, availability, refundable, limit, skip, adult, child } = req.query;
            const { id: hotel_code } = req.web_token;
            // model
            const model = this.Model.clientModel();
            const { data, total } = yield model.getAllRoom({
                key: key,
                availability: availability,
                refundable: refundable,
                adult: adult,
                child: child,
                limit: limit,
                skip: skip,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get all available and unavailable room
    getAllAvailableAndUnavailableRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: [],
            };
        });
    }
    // get All available Room
    getAllAvailableRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: [],
            };
        });
    }
    // get Single Hotel Room
    getSingleHotelRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { room_id } = req.params;
            const { id: hotel_code } = req.web_token;
            const model = this.Model.clientModel();
            const data = yield model.getSingleRoom(hotel_code, parseInt(room_id));
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // get All Hotel room images
    getAllHotelRoomImages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip } = req.query;
            const { id: hotel_code } = req.web_token;
            // model
            const model = this.Model.clientModel();
            const { data } = yield model.getHotelRoomImages({
                limit: limit,
                skip: skip,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.ClientRoomService = ClientRoomService;
exports.default = ClientRoomService;
//# sourceMappingURL=room.service.js.map