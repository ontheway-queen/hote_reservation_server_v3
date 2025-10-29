"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const configuration_controller_1 = __importDefault(require("../controllers/configuration.controller"));
class ResConfigurationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new configuration_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/prepare-food-option")
            .patch(this.controller.updatePrepareFoodOption);
    }
}
exports.default = ResConfigurationRouter;
//# sourceMappingURL=configuration.router.js.map