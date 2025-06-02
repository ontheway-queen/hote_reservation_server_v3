import AbstractRouter from "../../abstarcts/abstract.router";
import ExpenseReportController from "../controllers/report.expense.controller";

class ExpenseReportRouter extends AbstractRouter {
  public expenseReportController;

  constructor() {
    super();
    this.expenseReportController = new ExpenseReportController();
    this.callRouter();
  }
  private callRouter() {}
}
export default ExpenseReportRouter;
