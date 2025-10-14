"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const unit_controller_1 = __importDefault(require("../controllers/unit.controller"));
class HotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new unit_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.controller.createUnit)
            .get(this.controller.getUnits);
        this.router
            .route("/:id")
            .patch(this.controller.updateUnit)
            .delete(this.controller.deleteUnit);
    }
}
exports.default = HotelRouter;
//# sourceMappingURL=hotel.router.js.map