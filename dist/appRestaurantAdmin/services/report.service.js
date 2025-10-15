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
class RestaurantReportService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getOrderInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const data = yield model.getOrderInfo({
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    getDailyOrderCounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const { from_date, to_date } = req.query;
            const data = yield model.getDailyOrderCounts({
                hotel_code,
                restaurant_id,
                to_date: to_date,
                from_date: from_date,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    getSellingItems(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const data = yield model.getFoodSalesSummary({
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    getSellsReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const { from_date, to_date } = req.query;
            const data = yield model.getSellsReport({
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    getProductsReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const { from_date, to_date, name, category } = req.query;
            const data = yield model.getProductsReport({
                from_date: from_date,
                to_date: to_date,
                name: name,
                category: category,
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    getUserSellsReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id } = req.restaurant_admin;
            const model = this.restaurantModel.restaurantReportModel();
            const { from_date, to_date, user_id } = req.query;
            const data = yield model.getUserSellsReport({
                from_date: from_date,
                to_date: to_date,
                user_id: Number(user_id),
                hotel_code,
                restaurant_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
}
exports.default = RestaurantReportService;
//# sourceMappingURL=report.service.js.map