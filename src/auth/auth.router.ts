import AuthChecker from "../common/middleware/authChecker/authChecker";
import HotelAdminAuthRouter from "./router/auth.hotel-admin.router";
import AuthHotelUserRouter from "./router/auth.hotel-user.router";
import MAdminAuthRouter from "./router/mAuth.admin.router";
import { Router } from "express";

class AuthRouter {
  public AuthRouter = Router();

  private authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }
  private callRouter() {
    // user auth for hotel
    this.AuthRouter.use(
      "/hotel-user",
      this.authChecker.webTokenVerfiyChecker,
      new AuthHotelUserRouter().router
    );

    // admin auth for hotel
    this.AuthRouter.use("/reservation", new HotelAdminAuthRouter().router);

    // ================== m360ict admin panel auth ================== //

    this.AuthRouter.use("/m-admin", new MAdminAuthRouter().router);
  }
}

export default AuthRouter;
