import AbstractRouter from "../../abstarcts/abstract.router";
import ReportController from "../controllers/report.controller";
import AccountReportRouter from "./report.account.router";
import ClientLegderReportRouter from "./report.client-ledger.router";
import ExpenseReportRouter from "./report.expense.router";
import SalaryExpenseRouter from "./report.salary.router";

class ReportRouter extends AbstractRouter {
  public reportController = new ReportController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use("/account", new AccountReportRouter().router);

    this.router.use("/expense", new ExpenseReportRouter().router);

    this.router.use("/salary", new SalaryExpenseRouter().router);

    this.router.use("/client-ledger", new ClientLegderReportRouter().router);

    this.router
      .route("/hotel-statistics")
      .get(this.reportController.getHotelStatistics);

    this.router
      .route("/guest-report")
      .get(this.reportController.getGuestReport);

    this.router
      .route("/inhouse-guest")
      .get(this.reportController.inhouseGuestListReport);

    this.router
      .route("/departure-room")
      .get(this.reportController.departureRoomListReport);

    this.router
      .route("/arrival-room")
      .get(this.reportController.arrivalRoomListReport);

    this.router
      .route("/guest-ledger/by-guest/:id")
      .get(this.reportController.getSingleGuestLedger);

    this.router
      .route("/guest-distribution-countrywise")
      .get(this.reportController.getGuestDistributionCountryWise);

    this.router
      .route("/account-dashboard")
      .get(this.reportController.getAccountReport);

    this.router
      .route("/room_dashboard")
      .get(this.reportController.getRoomReport);

    this.router.get(
      "/room-type-availability",
      this.reportController.getRoomReport
    );
  }
}
export default ReportRouter;
