import { Router } from "express";
import AuthChecker from "../common/middleware/authChecker/authChecker";
import { BtocHotelRouter } from "./routers/btoc.hotel.router";
import { BtocHotelController } from "./controllers/btoc.hotel.controller";
import { BtocConfigRouter } from "./routers/btocConfig.router";
import { BtocCommonRouter } from "./routers/btocCommon.router";

export class BtocRootRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new BtocHotelController();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/hotel/search-availability")
      .post(
        this.authChecker.whiteLabelTokenVerfiy,
        this.controller.searchAvailability
      );

    this.router
      .route("/hotel/recheck")
      .post(this.authChecker.whiteLabelTokenVerfiy, this.controller.recheck);

    this.router
      .route("/gateways")
      .get(this.authChecker.whiteLabelTokenVerfiy, this.controller.recheck);

    this.router.use(
      "/hotel",
      this.authChecker.whiteLabelTokenVerfiy,
      this.authChecker.btocUserAuthChecker,
      new BtocHotelRouter().router
    );

    this.router.use(
      "/config",
      this.authChecker.whiteLabelTokenVerfiy,
      new BtocConfigRouter().router
    );

    this.router.use(
      "/common",
      this.authChecker.whiteLabelTokenVerfiy,
      new BtocCommonRouter().router
    );
  }
}
