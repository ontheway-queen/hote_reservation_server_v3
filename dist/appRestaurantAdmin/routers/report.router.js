"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const report_controller_1 = __importDefault(require("../controllers/report.controller"));
class RestaurantReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new report_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router.route("/order-info").get(this.controller.getOrderInfo);
        this.router
            .route("/daily-order-counts")
            .get(this.controller.getDailyOrderCounts);
        this.router
            .route("/hourly-order-counts")
            .get(this.controller.getHourlyOrders);
        this.router
            .route("/get-selling-items")
            .get(this.controller.getSellingItems);
        this.router.route("/sells-report").get(this.controller.getSellsReport);
        this.router
            .route("/products-report")
            .get(this.controller.getProductsReport);
        this.router
            .route("/user-sells-report")
            .get(this.controller.getUserSellsReport);
    }
}
exports.default = RestaurantReportRouter;
//# sourceMappingURL=report.router.js.map