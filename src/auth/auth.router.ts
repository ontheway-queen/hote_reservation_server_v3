import AuthChecker from "../common/middleware/authChecker/authChecker";
import HotelAdminAuthRouter from "./router/auth.hotel-admin.router";
import BtocUserAuthRouter from "./router/btoc.auth.router";
import MAdminAuthRouter from "./router/mAuth.admin.router";
import { Router } from "express";

class AuthRouter {
  public AuthRouter = Router();

  private authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }
  private callRouter() {
    // admin auth for hotel
    this.AuthRouter.use("/reservation", new HotelAdminAuthRouter().router);

    this.AuthRouter.use(
      "/btoc",
      this.authChecker.whiteLabelTokenVerfiy,
      new BtocUserAuthRouter().router
    );

    this.AuthRouter.use("/m-admin", new MAdminAuthRouter().router);
  }
}

export default AuthRouter;
