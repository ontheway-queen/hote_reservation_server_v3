"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const mHotel_common_controller_1 = __importDefault(require("../controllers/mHotel.common.controller"));
class mHotelCommonRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new mHotel_common_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/accommodation").get(this.controller.getAllAccomodation);
        this.router.route("/city").get(this.controller.getAllCity);
        this.router.route("/country").get(this.controller.getAllCountry);
    }
}
exports.default = mHotelCommonRouter;
//# sourceMappingURL=mHotel.common.router.js.map