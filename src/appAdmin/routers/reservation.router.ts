import { Router } from "express";
import AuthChecker from "../../common/middleware/authChecker/authChecker";
import { ReservationController } from "./../controllers/reservation.controller";

export class ReservationRouter {
  public router = Router();
  public authChecker = new AuthChecker();
  private controller = new ReservationController();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/availability/search")
      .post(this.controller.getAllAvailableRooms);

    // booking

    this.router
      .route("/booking")
      .post(
        this.authChecker.hotelAdminAuthChecker,
        this.controller.createBooking
      );
  }
}
