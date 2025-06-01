import AbstractRouter from "../../abstarcts/abstract.router";
import AccountReportController from "../controllers/report.account.controller";

class AccountReportRouter extends AbstractRouter {
  private reportController;
  constructor() {
    super();
    this.reportController = new AccountReportController();
    this.callRouter();
  }
  private callRouter() {
    // get all account report
    this.router.route("/").get(this.reportController.getAccountReport);

    //<sabbir.m360ict@gmail.com> ---- Sabbir Hosen;
    // Account Reports
    this.router.get("/journal", this.reportController.getJournalReport);

    this.router.get("/ledger", this.reportController.getAccLedger);

    this.router.get(
      "/trail-balance",
      this.reportController.getTrialBalanceReport
    );

    this.router.get(
      "/income-statement",
      this.reportController.getIncomeStatement
    );

    this.router.get("/balance-sheet", this.reportController.getBalanceSheet);
  }
}
export default AccountReportRouter;
