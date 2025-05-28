import { Router } from "express";
import { ReservationRootRouter } from "../appAdmin/routers/reservationRoot.router";
import ManagementRouter from "../appM360/routers/managementRoot.router";

import AuthRouter from "../auth/auth.router";
import CommonRouter from "../common/router/common.router";

class RootRouter {
  public v1Router = Router();

  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    // auth router
    this.v1Router.use("/common", new CommonRouter().router);

    // common router for all
    this.v1Router.use("/auth", new AuthRouter().AuthRouter);

    // ================== reservation ===================== //
    this.v1Router.use("/reservation", new ReservationRootRouter().router);

    // ================== management admin panel ===================//
    this.v1Router.use("/management", new ManagementRouter().managementRouter);
  }
}
export default RootRouter;
