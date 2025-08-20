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
            .route("/available-room/by/room-type/:id")
            .get(this.controller.getAllAvailableRoomsByRoomType);
        this.router
            .route("/booking")
            .post(this.controller.createBooking)
            .get(this.controller.getAllBooking);
        this.router
            .route("/group-booking")
            .post(this.controller.createGroupBooking)
            .get(this.controller.getAllGroupBooking);
        this.router
            .route("/individual-booking")
            .get(this.controller.getAllIndividualBooking);
        this.router
            .route("/booking/by/booking-mode")
            .get(this.controller.getArrivalDepStayBookings);
        this.router
            .route("/booking/:id")
            .get(this.controller.getSingleBooking)
            .patch(this.controller.updateSingleReservation);
        this.router
            .route("/booking/cancel/:id")
            .delete(this.controller.cancelBooking);
        this.router
            .route("/booking/update-room-and-rate/:id")
            .patch(this.controller.updateRoomAndRateOfReservation);
        this.router
            .route("/booking/change-rate-for-room/by-booking/:id")
            .patch(this.controller.changedRateOfARoomInReservation);
        this.router
            .route("/booking/add-room/by-booking/:id")
            .patch(this.controller.addRoomInReservation);
        this.router
            .route("/booking/remove-room/by-booking/:id")
            .delete(this.controller.deleteRoomInReservation);
        this.router
            .route("/booking/change-dates/by-booking/:id")
            .patch(this.controller.changeDatesOfBooking);
        this.router
            .route("/booking/individual-room-dates-change/by-booking/:id")
            .patch(this.controller.individualRoomDatesChangeOfBooking);
        this.router
            .route("/booking/change-room/by-booking/:id")
            .patch(this.controller.changeRoomOfAReservation);
        this.router
            .route("/booking/room-others/by-booking/:booking_id/by-room-id/:room_id")
            .patch(this.controller.updateOthersOfARoomByBookingID);
        this.router
            .route("/folios-by/booking_id/:id")
            .get(this.controller.getFoliosbySingleBooking);
        this.router
            .route("/folios-with-entries-by/booking_id/:id")
            .get(this.controller.getFoliosWithEntriesbySingleBooking);
        this.router
            .route("/folio-entries/by/folio-id/:id")
            .get(this.controller.getFolioEntriesbyFolioID);
        this.router.route("/add-payment").post(this.controller.addPaymentByFolioID);
        this.router
            .route("/refund-payment")
            .post(this.controller.refundPaymentByFolioID);
        this.router
            .route("/adjust-balance")
            .post(this.controller.adjustAmountByFolioID);
        this.router.route("/add-item").post(this.controller.addItemByFolioID);
        this.router.route("/checkin/by/booking/:id").patch(this.controller.checkIn);
        this.router
            .route("/individual-checkin/by/booking-id/:id/room-id/:room_id")
            .patch(this.controller.individualRoomCheckIn);
        this.router
            .route("/checkout/by/booking/:id")
            .patch(this.controller.checkOut);
        this.router
            .route("/individual-checkout/by/booking-id/:id/room-id/:room_id")
            .patch(this.controller.individualRoomCheckOut);
        this.router
            .route("/reservation-type/by/booking/:id")
            .patch(this.controller.updateReservationHoldStatus);
        this.router
            .route("/add-or-remove-guest/by/booking_id/:id/room/:room_id")
            .post(this.controller.updateOrRemoveGuestFromRoom);
    }
}
exports.ReservationRouter = ReservationRouter;
//# sourceMappingURL=reservation.router.js.map