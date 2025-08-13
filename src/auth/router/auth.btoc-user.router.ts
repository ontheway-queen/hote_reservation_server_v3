import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import BtocUserAuthController from "../controller/auth.btoc-user.controller";

class BtocUserAuthRouter extends AbstractRouter {
	private btocUserAuthController = new BtocUserAuthController();
	private authChecker = new AuthChecker();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// registration
		this.router
			.route("/user-registration")
			.post(
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.btocUserAuthController.registration
			);

		// login
		this.router
			.route("/user-login")
			.post(this.btocUserAuthController.login);

		// forget password
		this.router
			.route("/user-forget-password")
			.patch(this.btocUserAuthController.forgetPassword);

		// change password
		this.router
			.route("/user-change-password")
			.patch(
				this.authChecker.btocUserAuthChecker,
				this.btocUserAuthController.changePassword
			);
	}
}
export default BtocUserAuthRouter;
