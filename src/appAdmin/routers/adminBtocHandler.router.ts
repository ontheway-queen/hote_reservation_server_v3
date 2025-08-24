import AbstractRouter from "../../abstarcts/abstract.router";
import AdminBtocHandlerController from "../controllers/adminBtocHandler.controller";

class AdminBtocHandlerRouter extends AbstractRouter {
	private controller = new AdminBtocHandlerController();
	constructor() {
		super();

		this.callRouter();
	}
	private callRouter() {
		this.router
			.route("/site-configuration")
			.get(this.controller.getSiteConfiguration)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updateSiteConfig
			);

		this.router
			.route("/pop-up-banner")
			.get(this.controller.getPopUpBannerConfiguration)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updatePopUpBanner
			);

		this.router
			.route("/hero-bg-content")
			.get(this.controller.getHeroBgContent)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updateHeroBgContent
			);

		this.router
			.route("/hot-deals")
			.get(this.controller.getHotDeals)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updateHotDeals
			);

		this.router
			.route("/social-links")
			.get(this.controller.getSocialLinks)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updateSocialLinks
			);

		this.router
			.route("/popular-room-types")
			.get(this.controller.getPopularRoomTypes)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updatePopularRoomTypes
			);

		// ======================== Service Content ================================ //
		this.router
			.route("/hotel-service-content")
			.post(this.controller.createHotelServiceContent)
			.patch(this.controller.updateHotelServiceContent)
			.get(this.controller.getHotelContentService);

		// ======================== Services ================================ //
		this.router
			.route("/hotel-services")
			.post(
				this.uploader.cloudUploadRaw("hotel_services"),
				this.controller.createHotelService
			)
			.get(this.controller.getAllServices);

		this.router
			.route("/hotel-services/:id")
			.get(this.controller.getSingleService)
			.patch(
				this.uploader.cloudUploadRaw("services"),
				this.controller.updateService
			)
			.delete(this.controller.deleteService);
	}
}
export default AdminBtocHandlerRouter;
