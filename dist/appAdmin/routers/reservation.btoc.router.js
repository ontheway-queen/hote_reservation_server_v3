"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const btoc_reservation_controller_1 = __importDefault(require("../controllers/btoc.reservation.controller"));
class AdminBtocReservationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new btoc_reservation_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getAllReservation);
    }
}
exports.default = AdminBtocReservationRouter;
//# sourceMappingURL=reservation.btoc.router.js.map