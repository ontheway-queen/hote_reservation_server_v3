"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const measurement_controller_1 = __importDefault(require("../controllers/measurement.controller"));
class RestaurantMeasurementRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new measurement_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.controller.createMeasurement)
            .get(this.controller.getMeasurements);
        this.router
            .route("/:id")
            .patch(this.controller.updateMeasurement)
            .delete(this.controller.deleteMeasurement);
    }
}
exports.default = RestaurantMeasurementRouter;
//# sourceMappingURL=measurement.router.js.map