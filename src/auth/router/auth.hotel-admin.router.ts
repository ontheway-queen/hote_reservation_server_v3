import AbstractRouter from "../../abstarcts/abstract.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import HotelAdminAuthController from "../controller/auth.hotel-admin.controller";

class HotelAdminAuthRouter extends AbstractRouter {
  private adminAuthController = new HotelAdminAuthController();
  private authChecker = new AuthChecker();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/login").post(this.adminAuthController.login);

    this.router
      .route("/profile")
      .get(
        this.authChecker.hotelAdminAuthChecker,
        this.adminAuthController.getProfile
      )
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
        this.authChecker.hotelAdminAuthChecker,
        this.adminAuthController.updateProfile
      );

    this.router
      .route("/forget-password")
      .post(this.adminAuthController.forgetPassword);

    this.router
      .route("/change-password")
      .post(
        this.authChecker.hotelAdminAuthChecker,
        this.adminAuthController.changeAdminPassword
      );
  }
}
export default HotelAdminAuthRouter;
