import { Router } from "express";
import MAdministrationRouter from "./mAdmin.administration.router";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import MHotelRouter from "./mHotel.router";
import MConfigurationRouter from "./mConfiguration.router";

class ManagementRouter {
  public managementRouter = Router();
  public authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // hotel router
    this.managementRouter.use(
      "/hotel",
      this.authChecker.mAdminAuthChecker,
      new MHotelRouter().router
    );

    // configuration
    this.managementRouter.use(
      "/configuration",
      this.authChecker.mAdminAuthChecker,
      new MConfigurationRouter().router
    );

    // administration router
    this.managementRouter.use(
      "/administration",
      this.authChecker.mAdminAuthChecker,
      new MAdministrationRouter().router
    );
  }
}
export default ManagementRouter;
