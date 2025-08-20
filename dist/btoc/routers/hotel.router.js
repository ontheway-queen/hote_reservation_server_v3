"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocHotelRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const hotel_controller_1 = require("../controllers/hotel.controller");
class BtocHotelRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new hotel_controller_1.BtocHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/search-availability")
            .get(this.controller.searchAvailability);
    }
}
exports.BtocHotelRouter = BtocHotelRouter;
//# sourceMappingURL=hotel.router.js.map