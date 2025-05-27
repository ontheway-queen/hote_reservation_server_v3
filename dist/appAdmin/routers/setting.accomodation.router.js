"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const setting_accomodation_controller_1 = require("../controllers/setting.accomodation.controller");
class AccomodationSettingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new setting_accomodation_controller_1.AccomodationSettingController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.insertAccomodation)
            .get(this.controller.getAccomodation)
            .patch(this.controller.updateAccomodation);
    }
}
exports.default = AccomodationSettingRouter;
//# sourceMappingURL=setting.accomodation.router.js.map