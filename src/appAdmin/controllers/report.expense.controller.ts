import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ExpenseReportService from "../services/report.expense.service";
import ReportValidator from "../utlis/validator/reports.validator";

class ExpenseReportController extends AbstractController {
  private expenseReportService = new ExpenseReportService();
  private reportvalidator = new ReportValidator();

  constructor() {
    super();
  }
}
export default ExpenseReportController;
