import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import UseController from "../controller/user.controller";

class UserRouter extends AbstractRouter {
	private controller = new UseController();
	private authChecker = new AuthChecker();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// prifle
		this.router
			.route("/profile")
			.get(
				this.authChecker.btocUserAuthChecker,
				this.controller.getProfile
			)
			.patch(
				this.authChecker.btocUserAuthChecker,
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.controller.updateProfile
			);
	}
}
export default UserRouter;
