"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRootRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../common/middleware/authChecker/authChecker"));
const measurement_router_1 = __importDefault(require("./routers/measurement.router"));
const menuCategory_router_1 = __importDefault(require("./routers/menuCategory.router"));
const restaurantTable_router_1 = __importDefault(require("./routers/restaurantTable.router"));
class RestaurantRootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/table", this.authChecker.hotelRestaurantAuthChecker, new restaurantTable_router_1.default().router);
        this.router.use("/menu-category", this.authChecker.hotelRestaurantAuthChecker, new menuCategory_router_1.default().router);
        this.router.use("/measurement", this.authChecker.hotelRestaurantAuthChecker, new measurement_router_1.default().router);
    }
}
exports.RestaurantRootRouter = RestaurantRootRouter;
//# sourceMappingURL=restaurant.rootrouter.js.map