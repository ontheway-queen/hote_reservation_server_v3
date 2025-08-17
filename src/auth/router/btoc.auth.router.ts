import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import BtocUserAuthController from "../controller/btoc.auth.controller";

class BtocUserAuthRouter extends AbstractRouter {
  private btocUserAuthController = new BtocUserAuthController();
  private authChecker = new AuthChecker();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/registration")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.BTOC_USERS_FILES),
        this.btocUserAuthController.registration
      );

    this.router.route("/login").post(this.btocUserAuthController.login);

    this.router
      .route("/profile")
      .get(
        this.authChecker.btocUserAuthChecker,
        this.btocUserAuthController.getProfile
      );
    // .patch(
    //   this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
    //   this.authChecker.hotelAdminAuthChecker,
    //   this.adminAuthController.updateProfile
    // );

    this.router
      .route("/forget-password")
      .patch(this.btocUserAuthController.forgetPassword);

    this.router
      .route("/change-password")
      .patch(
        this.authChecker.btocUserAuthChecker,
        this.btocUserAuthController.changePassword
      );
  }
}
export default BtocUserAuthRouter;
