"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationRoot_router_1 = require("../appAdmin/routers/reservationRoot.router");
const managementRoot_router_1 = __importDefault(require("../appM360/routers/managementRoot.router"));
const reservation_client_router_1 = __importDefault(require("../appReservationClient/routers/reservation-client.router"));
const restaurant_app_router_1 = __importDefault(require("../appRestaurant/routers/restaurant.app.router"));
const auth_router_1 = __importDefault(require("../auth/auth.router"));
const common_router_1 = __importDefault(require("../common/router/common.router"));
class RootRouter {
    constructor() {
        this.v1Router = (0, express_1.Router)();
        this.callV1Router();
    }
    callV1Router() {
        // auth router
        this.v1Router.use("/common", new common_router_1.default().router);
        // common router for all
        this.v1Router.use("/auth", new auth_router_1.default().AuthRouter);
        // ================== reservation ===================== //
        this.v1Router.use("/reservation", new reservationRoot_router_1.ReservationRootRouter().router);
        // ================== restaurant ===================== //
        this.v1Router.use("/restaurant", new restaurant_app_router_1.default().restaurantRouter);
        // ==================  reservation client ===================== //
        this.v1Router.use("/reservation-client", new reservation_client_router_1.default().hUserRouter);
        // ================== management admin panel ===================//
        this.v1Router.use("/management", new managementRoot_router_1.default().managementRouter);
    }
}
exports.default = RootRouter;
//# sourceMappingURL=router.js.map