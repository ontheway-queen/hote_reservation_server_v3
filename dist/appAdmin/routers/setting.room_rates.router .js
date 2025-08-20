"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const setting_room_rates_controller_1 = __importDefault(require("../controllers/setting.room_rates.controller"));
class RoomRatesRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new setting_room_rates_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createRoomRate)
            .get(this.controller.getAllRoomRate);
        this.router
            .route("/:id")
            .get(this.controller.getSingleRoomRate)
            .put(this.controller.updateSingleRoomRate);
    }
}
exports.default = RoomRatesRouter;
//# sourceMappingURL=setting.room_rates.router%20.js.map