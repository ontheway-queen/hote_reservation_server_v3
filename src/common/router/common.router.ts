import CommonAbstractRouter from "../commonAbstract/common.abstract.router";
import CommonController from "../controllers/common.controller";

class CommonRouter extends CommonAbstractRouter {
  private CommonController = new CommonController();
  constructor() {
    super();
    this.callRouter();
  }

  // call router
  private callRouter() {
    this.router.post(
      "/send-email-otp",
      this.CommonController.sendEmailOtpController
    );

    this.router.post(
      "/match-email-otp",
      this.CommonController.matchEmailOtpController
    );

    this.router.get("/country", this.CommonController.getAllCountry);
  }
}

export default CommonRouter;
