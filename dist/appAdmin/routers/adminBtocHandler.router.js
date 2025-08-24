"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const adminBtocHandler_controller_1 = __importDefault(require("../controllers/adminBtocHandler.controller"));
const reservation_btoc_router_1 = __importDefault(require("./reservation.btoc.router"));
class AdminBtocHandlerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminBtocHandler_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/site-configuration")
            .get(this.controller.getSiteConfiguration)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updateSiteConfig);
        this.router
            .route("/pop-up-banner")
            .get(this.controller.getPopUpBannerConfiguration)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updatePopUpBanner);
        this.router
            .route("/hero-bg-content")
            .get(this.controller.getHeroBgContent)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updateHeroBgContent);
        this.router
            .route("/hot-deals")
            .get(this.controller.getHotDeals)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updateHotDeals);
        this.router
            .route("/social-links")
            .get(this.controller.getSocialLinks)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updateSocialLinks);
        this.router
            .route("/popular-room-types")
            .get(this.controller.getPopularRoomTypes)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES), this.controller.updatePopularRoomTypes);
        //  reservation root router
        this.router.use("/reservation", new reservation_btoc_router_1.default().router);
    }
}
exports.default = AdminBtocHandlerRouter;
//# sourceMappingURL=adminBtocHandler.router.js.map