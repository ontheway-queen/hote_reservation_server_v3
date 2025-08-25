"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const siteConfiguration_1 = __importDefault(require("./siteConfiguration"));
class AdminBtocHandlerRouter extends abstract_router_1.default {
    // private controller = new AdminBtocHandlerController();
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/site-config", new siteConfiguration_1.default().router);
        // this.router
        //   .route("/site-configuration")
        //   .get(this.controller.getSiteConfiguration)
        //   .patch(
        //     this.uploader.cloudUploadRaw(this.fileFolders.BTOC_SITE_CONFIG_FILES),
        //     this.controller.updateSiteConfig
        //   );
        // this.router
        //   .route("/pop-up-banner")
        //   .get(this.controller.getPopUpBannerConfiguration)
        //   .patch(
        //     this.uploader.cloudUploadRaw(this.fileFolders.BTOC_SITE_CONFIG_FILES),
        //     this.controller.updatePopUpBanner
        //   );
        // this.router
        //   .route("/hero-bg")
        //   .get(this.controller.getHeroBGContent)
        //   .post(
        //     this.uploader.cloudUploadRaw(
        //       this.fileFolders.BTOC_SITE_CONFIG_HERO_BG_FILES
        //     ),
        //     this.controller.createHeroBGContent
        //   );
        // this.router
        //   .route("/hero-bg/:id")
        //   .patch(
        //     this.uploader.cloudUploadRaw(
        //       this.fileFolders.BTOC_SITE_CONFIG_HERO_BG_FILES
        //     ),
        //     this.controller.updateHeroBGContent
        //   )
        //   .delete(this.controller.deleteHeroBGContent);
        // this.router
        //   .route("/hot-deals")
        //   .get(this.controller.getHotDeals)
        //   .patch(
        //     this.uploader.cloudUploadRaw(this.fileFolders.BTOC_SITE_CONFIG_FILES),
        //     this.controller.updateHotDeals
        //   );
        // this.router
        //   .route("/social-links")
        //   .get(this.controller.getSocialLinks)
        //   .patch(
        //     this.uploader.cloudUploadRaw(this.fileFolders.BTOC_SITE_CONFIG_FILES),
        //     this.controller.updateSocialLinks
        //   );
        // this.router
        //   .route("/popular-room-types")
        //   .get(this.controller.getPopularRoomTypes)
        //   .patch(
        //     this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
        //     this.controller.updatePopularRoomTypes
        //   );
        // ======================== Service Content ================================ //
        // this.router
        //   .route("/hotel-service-content")
        //   .post(this.controller.createHotelServiceContent)
        //   .patch(this.controller.updateHotelServiceContent)
        //   .get(this.controller.getHotelContentService);
        // // ======================== Services ================================ //
        // this.router
        //   .route("/hotel-services")
        //   .post(
        //     this.uploader.cloudUploadRaw("hotel_services"),
        //     this.controller.createHotelService
        //   )
        //   .get(this.controller.getAllServices);
        // this.router
        //   .route("/hotel-services/:id")
        //   .get(this.controller.getSingleService)
        //   .patch(
        //     this.uploader.cloudUploadRaw("services"),
        //     this.controller.updateService
        //   )
        //   .delete(this.controller.deleteService);
    }
}
exports.default = AdminBtocHandlerRouter;
//# sourceMappingURL=adminBtocHandler.router.js.map