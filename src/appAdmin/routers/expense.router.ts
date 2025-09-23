import AbstractRouter from "../../abstarcts/abstract.router";
import ExpenseController from "../controllers/expense.controller";

class ExpenseRouter extends AbstractRouter {
  public expenseController;

  constructor() {
    super();
    this.expenseController = new ExpenseController();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/head").get(this.expenseController.getAllExpenseHead);

    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.EXPENSE_FILES),
        this.expenseController.createExpense
      )
      .get(this.expenseController.getAllExpense);

    this.router
      .route("/:id")
      .get(this.expenseController.getSingleExpense)
      .delete(this.expenseController.deleteExpenseController)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.EXPENSE_FILES),
        this.expenseController.updateExpenseController
      );
  }
}

export default ExpenseRouter;
