import { Router } from "express";
import AuthChecker from "../common/middleware/authChecker/authChecker";
import { BtocHotelRouter } from "./routers/hotel.router";

export class BtocRootRouter {
  public router = Router();
  public authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router.use(
      "/hotel",
      this.authChecker.webTokenVerfiyChecker,
      new BtocHotelRouter().router
    );
  }
}
