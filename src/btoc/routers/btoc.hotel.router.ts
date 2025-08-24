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
      .route("/booking")
      .post(this.controller.booking)
      .get(this.controller.getAllBooking);

    this.router
      .route("/booking/:ref_id")
      .get(this.controller.getSingleBooking)
      .delete(this.controller.cancelSingleBooking);
  }
}
