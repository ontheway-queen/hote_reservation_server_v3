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
      .route("/room-type/availability/search")
      .get(this.controller.getAllAvailableRoomsTypeWithAvailableRoomCount);

    this.router
      .route("/available-room/by/room-type/:id")
      .get(this.controller.getAllAvailableRoomsByRoomType);
  }
}
