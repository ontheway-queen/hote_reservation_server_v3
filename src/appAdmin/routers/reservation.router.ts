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
    this.router.route("/calendar").get(this.controller.calendar);

    this.router
      .route("/room-type/availability/search")
      .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);

    this.router
      .route("/room-type/by/availabity-room-count")
      .get(this.controller.getAllAvailableRoomsTypeForEachDateAvailableRoom);

    this.router
      .route("/room-type/availability/search")
      .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);

    this.router
      .route("/available-room/by/room-type/:id")
      .get(this.controller.getAllAvailableRoomsByRoomType);

    this.router
      .route("/booking")
      .post(this.controller.createBooking)
      .get(this.controller.getAllBooking);
  }
}
