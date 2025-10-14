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
class RestaurantHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    geAllBookings(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const { limit, skip, search } = req.query;
            const data = yield this.restaurantModel
                .restaurantHotelModel()
                .getAllBooking({
                hotel_code,
                limit: limit,
                skip: skip,
                search: search,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    getAllAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const { ac_type, key, limit, skip } = req.query;
            const { data, total } = yield this.Model.accountModel().getAllAccounts({
                hotel_code,
                status: "true",
                ac_type: ac_type,
                key: key,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getAllFloors(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.restaurant_admin;
            const { data } = yield this.Model.settingModel().getAllFloors({
                hotel_code,
                status: "true",
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = RestaurantHotelService;
//# sourceMappingURL=res.hotel.service.js.map