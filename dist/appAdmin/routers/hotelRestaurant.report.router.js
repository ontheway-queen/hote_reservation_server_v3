"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const hotelRestaurant_report_controller_1 = __importDefault(require("../controllers/hotelRestaurant.report.controller"));
class HotelRestaurantReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelRestaurant_report_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/sales-report").get(this.controller.getSalesReport);
        this.router.route("/order-info").get(this.controller.getOrderInfo);
        this.router
            .route("/daily-order-counts")
            .get(this.controller.getDailyOrderCounts);
        this.router.route("/sales-chart").get(this.controller.getSalesChart);
        this.router
            .route("/products-report")
            .get(this.controller.getProductsReport);
        this.router
            .route("/user-sales-report")
            .get(this.controller.getUserSalesReport);
    }
}
exports.default = HotelRestaurantReportRouter;
//# sourceMappingURL=hotelRestaurant.report.router.js.map