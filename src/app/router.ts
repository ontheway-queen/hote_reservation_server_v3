import { Router } from "express";
import { ReservationRootRouter } from "../appAdmin/reservationRoot.router";
import ManagementRouter from "../appM360/routers/managementRoot.router";
import { RestaurantRootRouter } from "../appRestaurantAdmin/restaurant.rootrouter";
import AuthRouter from "../auth/auth.router";
import { BtocRootRouter } from "../btoc/btoc.rootRouter";
import CommonRouter from "../common/router/common.router";
import PaymentRouter from "../common/router/paymentRouter";

class RootRouter {
  public v1Router = Router();

  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    this.v1Router.use("/common", new CommonRouter().router);

    this.v1Router.use("/auth", new AuthRouter().AuthRouter);

    this.v1Router.use("/payment", new PaymentRouter().router);

    this.v1Router.use("/reservation", new ReservationRootRouter().router);

    this.v1Router.use("/btoc", new BtocRootRouter().router);

    this.v1Router.use("/management", new ManagementRouter().managementRouter);

    this.v1Router.use("/restaurant", new RestaurantRootRouter().router);
  }
}
export default RootRouter;
