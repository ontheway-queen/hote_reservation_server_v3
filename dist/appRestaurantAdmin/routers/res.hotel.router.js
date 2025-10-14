"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const res_hotel_controller_1 = __importDefault(require("../controllers/res.hotel.controller"));
class HotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new res_hotel_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router.route("/bookings").get(this.controller.geAllBookings);
        this.router.route("/account").get(this.controller.getAllAccount);
        this.router.route("/floors").get(this.controller.getAllFloors);
    }
}
exports.default = HotelRouter;
//# sourceMappingURL=res.hotel.router.js.map