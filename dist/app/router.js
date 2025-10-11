"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationRoot_router_1 = require("../appAdmin/reservationRoot.router");
const managementRoot_router_1 = __importDefault(require("../appM360/routers/managementRoot.router"));
const restaurant_rootrouter_1 = require("../appRestaurantAdmin/restaurant.rootrouter");
const auth_router_1 = __importDefault(require("../auth/auth.router"));
const btoc_rootRouter_1 = require("../btoc/btoc.rootRouter");
const common_router_1 = __importDefault(require("../common/router/common.router"));
const paymentRouter_1 = __importDefault(require("../common/router/paymentRouter"));
class RootRouter {
    constructor() {
        this.v1Router = (0, express_1.Router)();
        this.callV1Router();
    }
    callV1Router() {
        this.v1Router.use("/common", new common_router_1.default().router);
        this.v1Router.use("/auth", new auth_router_1.default().AuthRouter);
        this.v1Router.use("/payment", new paymentRouter_1.default().router);
        this.v1Router.use("/reservation", new reservationRoot_router_1.ReservationRootRouter().router);
        this.v1Router.use("/btoc", new btoc_rootRouter_1.BtocRootRouter().router);
        this.v1Router.use("/management", new managementRoot_router_1.default().managementRouter);
        this.v1Router.use("/restaurant", new restaurant_rootrouter_1.RestaurantRootRouter().router);
    }
}
exports.default = RootRouter;
//# sourceMappingURL=router.js.map