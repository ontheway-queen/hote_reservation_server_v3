import AbstractRouter from "../../abstarcts/abstract.router";
import RoomBookingReportController from "../controllers/report.room-booking.controller";

class RoomBookingReportRouter extends AbstractRouter {
  private roomBookingReportController;
  constructor() {
    super();
    this.roomBookingReportController = new RoomBookingReportController();
    this.callRouter();
  }
  private callRouter() {}
}
export default RoomBookingReportRouter;
