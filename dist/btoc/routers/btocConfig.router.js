"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocConfigRouter = void 0;
const express_1 = require("express");
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const btocConfig_controller_1 = require("../controllers/btocConfig.controller");
class BtocConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new btocConfig_controller_1.BtocConfigController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/home").get(this.controller.GetHomePageData);
        this.router.route("/about-us").get(this.controller.GetAboutUsPageData);
        this.router
            .route("/contact-us")
            .get(this.controller.GetContactUsPageData);
        this.router
            .route("/privacy-policy")
            .get(this.controller.GetPrivacyPolicyPageData);
        this.router
            .route("/terms-and-conditions")
            .get(this.controller.GetTermsAndConditionsPageData);
        this.router.route("/pop-up").get(this.controller.getPopUpBanner);
        this.router.route("/faq").get(this.controller.getAllFaq);
        this.router.route("/accounts").get(this.controller.GetAccountsData);
        this.router
            .route("/hotel-images")
            .get(this.controller.getAllHotelImages);
    }
}
exports.BtocConfigRouter = BtocConfigRouter;
//# sourceMappingURL=btocConfig.router.js.map