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
class HotelRestaurantReportService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getRestaurantSalesReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { from_date, to_date, order_type, limit, skip, restaurant_id } = req.query;
            const { data, total, totals } = yield this.restaurantModel
                .restaurantReportModel()
                .getSalesReport({
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                restaurant_id: Number(restaurant_id),
                order_type: order_type,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                totals,
                data,
            };
        });
    }
}
exports.default = HotelRestaurantReportService;
//# sourceMappingURL=hotelRestaurant.report.service.js.map