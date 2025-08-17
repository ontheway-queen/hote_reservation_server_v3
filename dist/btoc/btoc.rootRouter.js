"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocRootRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../common/middleware/authChecker/authChecker"));
const hotel_router_1 = require("./routers/hotel.router");
class BtocRootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/hotel", this.authChecker.whiteLabelTokenVerfiy, this.authChecker.btocUserAuthChecker, new hotel_router_1.BtocHotelRouter().router);
    }
}
exports.BtocRootRouter = BtocRootRouter;
//# sourceMappingURL=btoc.rootRouter.js.map