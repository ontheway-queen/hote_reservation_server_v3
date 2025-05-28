"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationRouter = void 0;
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const reservation_controller_1 = require("./../controllers/reservation.controller");
class ReservationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new reservation_controller_1.ReservationController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/calendar").get(this.controller.calendar);
        this.router
            .route("/room-type/availability/search")
            .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);
        this.router
            .route("/room-type/by/availabity-room-count")
            .get(this.controller.getAllAvailableRoomsTypeForEachDateAvailableRoom);
        this.router
            .route("/room-type/availability/search")
            .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);
        this.router
            .route("/available-room/by/room-type/:id")
            .get(this.controller.getAllAvailableRoomsByRoomType);
        this.router
            .route("/booking")
            .post(this.controller.createBooking)
            .get(this.controller.getAllBooking);
    }
}
exports.ReservationRouter = ReservationRouter;
//# sourceMappingURL=reservation.router.js.map