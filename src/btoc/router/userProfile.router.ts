import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import UseProfileController from "../controller/userProfile.controller";

class UserProfileRouter extends AbstractRouter {
	private useProfileController = new UseProfileController();
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
				this.useProfileController.getProfile
			)
			.patch(
				this.authChecker.btocUserAuthChecker,
				this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
				this.useProfileController.updateProfile
			);
	}
}
export default UserProfileRouter;
