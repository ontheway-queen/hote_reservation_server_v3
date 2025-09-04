"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocHotelRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const btoc_hotel_controller_1 = require("../controllers/btoc.hotel.controller");
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
class BtocHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new btoc_hotel_controller_1.BtocHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/booking")
            .post(this.controller.booking)
            .get(this.controller.getAllBooking);
        this.router
            .route("/booking/:ref_id")
            .get(this.controller.getSingleBooking)
            .delete(this.controller.cancelSingleBooking);
    }
}
exports.BtocHotelRouter = BtocHotelRouter;
//# sourceMappingURL=btoc.hotel.router.js.map