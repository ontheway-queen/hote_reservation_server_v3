"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocRootRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../common/middleware/authChecker/authChecker"));
const btoc_hotel_router_1 = require("./routers/btoc.hotel.router");
const btoc_hotel_controller_1 = require("./controllers/btoc.hotel.controller");
const btocConfig_router_1 = require("./routers/btocConfig.router");
class BtocRootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new btoc_hotel_controller_1.BtocHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/hotel/search-availability")
            .post(this.authChecker.whiteLabelTokenVerfiy, this.controller.searchAvailability);
        this.router
            .route("/hotel/recheck")
            .post(this.authChecker.whiteLabelTokenVerfiy, this.controller.recheck);
        this.router.use("/hotel", this.authChecker.whiteLabelTokenVerfiy, this.authChecker.btocUserAuthChecker, new btoc_hotel_router_1.BtocHotelRouter().router);
        this.router.use("/configuration", this.authChecker.whiteLabelTokenVerfiy, new btocConfig_router_1.BtocConfigRouter().router);
    }
}
exports.BtocRootRouter = BtocRootRouter;
//# sourceMappingURL=btoc.rootRouter.js.map