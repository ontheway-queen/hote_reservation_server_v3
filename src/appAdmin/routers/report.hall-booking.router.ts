import AbstractRouter from "../../abstarcts/abstract.router";
import HallBookingReportController from "../controllers/report.hall-booking.controller";

class HallBookingReportRouter extends AbstractRouter {
  private hallBookingReportController;
  constructor() {
    super();
    this.hallBookingReportController = new HallBookingReportController();
    this.callRouter();
  }
  private callRouter() {}
}
export default HallBookingReportRouter;
