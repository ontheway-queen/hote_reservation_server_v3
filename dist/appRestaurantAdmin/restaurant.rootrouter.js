"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRootRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../common/middleware/authChecker/authChecker"));
const food_router_1 = __importDefault(require("./routers/food.router"));
const menuCategory_router_1 = __importDefault(require("./routers/menuCategory.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const report_router_1 = __importDefault(require("./routers/report.router"));
const restaurantTable_router_1 = __importDefault(require("./routers/restaurantTable.router"));
const unit_router_1 = __importDefault(require("./routers/unit.router"));
const res_hotel_router_1 = __importDefault(require("./routers/res.hotel.router"));
class RestaurantRootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/table", this.authChecker.hotelRestaurantAuthChecker, new restaurantTable_router_1.default().router);
        this.router.use("/menu-category", this.authChecker.hotelRestaurantAuthChecker, new menuCategory_router_1.default().router);
        this.router.use("/hotel", this.authChecker.hotelRestaurantAuthChecker, new res_hotel_router_1.default().router);
        this.router.use("/unit", this.authChecker.hotelRestaurantAuthChecker, new unit_router_1.default().router);
        this.router.use("/food", this.authChecker.hotelRestaurantAuthChecker, new food_router_1.default().router);
        this.router.use("/order", this.authChecker.hotelRestaurantAuthChecker, new order_router_1.default().router);
        this.router.use("/report", this.authChecker.hotelRestaurantAuthChecker, new report_router_1.default().router);
    }
}
exports.RestaurantRootRouter = RestaurantRootRouter;
//# sourceMappingURL=restaurant.rootrouter.js.map