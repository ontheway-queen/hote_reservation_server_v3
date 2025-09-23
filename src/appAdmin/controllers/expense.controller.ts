import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ExpenseService from "../services/expense.service";
import ExpenseValidator from "../utlis/validator/expense.validator";

class ExpenseController extends AbstractController {
  private expenseService = new ExpenseService();
  private expensevalidator = new ExpenseValidator();

  constructor() {
    super();
  }

  public getAllExpenseHead = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.expenseService.getAllExpenseHead(
        req
      );

      res.status(code).json(data);
    }
  );

  public createExpense = this.asyncWrapper.wrap(
    { bodySchema: this.expensevalidator.createExpenseValidator },

    async (req: Request, res: Response) => {
      const result = await this.expenseService.createExpense(req);

      const { code, ...data } = result;
      res.status(code).json(data);
    }
  );

  public getAllExpense = this.asyncWrapper.wrap(
    { querySchema: this.expensevalidator.getAllExpenseQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.expenseService.getAllExpense(req);
      res.status(code).json(data);
    }
  );

  public getSingleExpense = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.expenseService.getSingleExpense(req);

      res.status(code).json(data);
    }
  );

  public updateExpenseController = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator(),
      bodySchema: this.expensevalidator.updateExpenseValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.expenseService.updateExpenseService(
        req
      );

      res.status(code).json(data);
    }
  );

  public deleteExpenseController = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.expenseService.deleteExpenseService(
        req
      );

      res.status(code).json(data);
    }
  );
}
export default ExpenseController;
