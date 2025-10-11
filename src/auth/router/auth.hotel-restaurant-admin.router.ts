import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import AuthHotelRestaurantAdminController from "../controller/auth.hotel-restaurant-admin.controller";

class AuthHotelRestaurantAdminRouter extends AbstractRouter {
	private controller = new AuthHotelRestaurantAdminController();
	private authChecker = new AuthChecker();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/login").post(this.controller.login);

		this.router
			.route("/profile")
			.get(
				this.authChecker.hotelRestaurantAuthChecker,
				this.controller.getProfile
			)
			.patch(
				this.authChecker.hotelRestaurantAuthChecker,
				this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
				this.controller.updateProfile
			);

		this.router
			.route("/forget-password")
			.patch(this.controller.resetForgetPassword);

		this.router
			.route("/change-password")
			.patch(
				this.authChecker.hotelRestaurantAuthChecker,
				this.controller.changeAdminPassword
			);
	}
}
export default AuthHotelRestaurantAdminRouter;
