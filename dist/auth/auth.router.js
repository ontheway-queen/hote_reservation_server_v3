"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../common/middleware/authChecker/authChecker"));
const auth_hotel_admin_router_1 = __importDefault(require("./router/auth.hotel-admin.router"));
const auth_hotel_restaurant_admin_router_1 = __importDefault(require("./router/auth.hotel-restaurant-admin.router"));
const btoc_auth_router_1 = __importDefault(require("./router/btoc.auth.router"));
const mAuth_admin_router_1 = __importDefault(require("./router/mAuth.admin.router"));
class AuthRouter {
    constructor() {
        this.AuthRouter = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        // admin auth for hotel
        this.AuthRouter.use("/reservation", new auth_hotel_admin_router_1.default().router);
        this.AuthRouter.use("/btoc", this.authChecker.whiteLabelTokenVerfiy, new btoc_auth_router_1.default().router);
        this.AuthRouter.use("/m-admin", new mAuth_admin_router_1.default().router);
        this.AuthRouter.use("/restaurant", new auth_hotel_restaurant_admin_router_1.default().router);
    }
}
exports.default = AuthRouter;
//# sourceMappingURL=auth.router.js.map