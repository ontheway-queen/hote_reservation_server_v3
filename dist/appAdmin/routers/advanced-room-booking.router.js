"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const advanced_room_booking_controller_1 = __importDefault(require("../controllers/advanced-room-booking.controller"));
class AdvancedRoomBookingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.roomBookingController = new advanced_room_booking_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // room booking router
        this.router
            .route("/")
            .post(this.roomBookingController.createRoomBooking)
            .get(this.roomBookingController.getAllRoomBooking);
        // confirm room booking
        this.router
            .route("/confirm/by-booking-id/:id")
            .post(this.roomBookingController.confirmRoomBooking);
        // check in router
        this.router
            .route("/check-in")
            .post(this.roomBookingController.insertBookingCheckIn)
            .get(this.roomBookingController.getAllRoomBookingCheckIn);
        // checkout router
        this.router
            .route("/check-out/:id")
            .post(this.roomBookingController.addBookingCheckOut);
        // extend room booking
        this.router
            .route("/extend/:id")
            .patch(this.roomBookingController.extendRoomBooking);
        // refund room booking
        this.router
            .route("/refund/:id")
            .patch(this.roomBookingController.refundRoomBooking);
        // single room booking
        this.router
            .route("/:id")
            .get(this.roomBookingController.getSingleRoomBooking);
    }
}
exports.default = AdvancedRoomBookingRouter;
//# sourceMappingURL=advanced-room-booking.router.js.map