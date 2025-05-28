"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const setting_root_controller_1 = require("../controllers/setting.root.controller");
class SettingRootRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new setting_root_controller_1.SettingRootController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/accommodation")
            .post(this.controller.insertAccomodation)
            .get(this.controller.getAccomodation)
            .patch(this.controller.updateAccomodation);
        //cancellation policy
        this.router
            .route("/cancellation-policy")
            .post(this.controller.insertCancellationPolicy)
            .get(this.controller.getAllCancellationPolicy);
        this.router
            .route("/cancellation-policy/:id")
            .get(this.controller.getSingleCancellationPolicy)
            .patch(this.controller.updateCancellationPolicy);
        this.router.route("/meal-plan").get(this.controller.getAllMealPlan);
        this.router.route("/sources").get(this.controller.getAllSources);
        this.router
            .route("/child-age-policies")
            .get(this.controller.getChildAgePolicies);
    }
}
exports.default = SettingRootRouter;
//# sourceMappingURL=setting.root.router.js.map