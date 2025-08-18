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
      .get(this.controller.searchAvailability);

    this.router.route("/room-rates").get(this.controller.searchAvailability);
  }
}
