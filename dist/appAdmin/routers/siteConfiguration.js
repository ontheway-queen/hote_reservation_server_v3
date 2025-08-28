"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const btocSiteConfig_controller_1 = require("../controllers/btocSiteConfig.controller");
class B2CSiteConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new btocSiteConfig_controller_1.B2CSiteConfigController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getSiteConfigData)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.B2C_SITE_CONFIG, [
            "main_logo",
            "site_thumbnail",
            "favicon",
        ]), this.controller.updateSiteConfig);
        this.router
            .route("/about-us")
            .get(this.controller.getAboutUsData)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.B2C_SITE_CONFIG, [
            "thumbnail",
        ]), this.controller.updateAboutUsData);
        this.router
            .route("/contact-us")
            .get(this.controller.getContactUsData)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.B2C_SITE_CONFIG, [
            "thumbnail",
        ]), this.controller.updateContactUsData);
        this.router
            .route("/privacy-policy")
            .get(this.controller.getPrivacyPolicyData)
            .patch(this.controller.updatePrivacyPolicyData);
        this.router
            .route("/terms-and-conditions")
            .get(this.controller.getTermsAndConditionsData)
            .patch(this.controller.updateTermsAndConditions);
        this.router
            .route("/social-links")
            .get(this.controller.getSocialLinks)
            .post(this.controller.createSocialLinks);
        this.router
            .route("/social-links/:id")
            .delete(this.controller.deleteSocialLinks)
            .patch(this.controller.updateSocialLinks);
        this.router
            .route("/pop-up-banner")
            .get(this.controller.getPopUpBanner)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.B2C_SITE_CONFIG_POP_UP), this.controller.upSertPopUpBanner);
        this.router
            .route("/faq-head")
            .get(this.controller.getAllFaqHeads)
            .post(this.controller.createFaqHead);
        this.router
            .route("/faq-head/:id")
            .get(this.controller.getSingleFaqHeadWithFaq)
            .patch(this.controller.updateFaqHead)
            .delete(this.controller.deleteFaqHead);
        this.router.route("/faq").post(this.controller.createFaq);
        this.router.route("/amenity-heads").get(this.controller.getAllAmenityHeads);
        this.router
            .route("/amenity-heads/:id")
            .get(this.controller.getAllAmenities);
        this.router
            .route("/hotel-amenities")
            .post(this.controller.addHotelAmenities)
            .get(this.controller.getAllHotelAmenities);
    }
}
exports.default = B2CSiteConfigRouter;
//# sourceMappingURL=siteConfiguration.js.map