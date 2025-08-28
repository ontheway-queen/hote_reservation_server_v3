"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
class BtocConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new AgentB2CConfigController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/home").get(this.controller.GetHomePageData);
        this.router.route("/about-us").get(this.controller.GetAboutUsPageData);
        this.router.route("/contact-us").get(this.controller.GetContactUsPageData);
        this.router
            .route("/privacy-policy")
            .get(this.controller.GetPrivacyPolicyPageData);
        this.router
            .route("/terms-and-conditions")
            .get(this.controller.GetTermsAndConditionsPageData);
        this.router.route("/accounts").get(this.controller.GetAccountsData);
    }
}
exports.default = BtocConfigRouter;
//# sourceMappingURL=btoc.config.router.js.map