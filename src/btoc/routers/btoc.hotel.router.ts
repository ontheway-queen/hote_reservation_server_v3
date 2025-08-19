import { Router } from "express";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import { BtocHotelController } from "../controllers/btoc.hotel.controller";

export class BtocHotelRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new BtocHotelController();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/search-availability")
      .post(this.controller.searchAvailability);

    this.router.route("/recheck").post(this.controller.recheck);

    this.router.route("/booking").post(this.controller.booking);
  }
}
