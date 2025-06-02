import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import SalaryExpenseReportService from "../services/report.salary.service";
import ReportValidator from "../utlis/validator/reports.validator";

class SalaryExpenseReportController extends AbstractController {
  private service = new SalaryExpenseReportService();
  private salaryReportValidator = new ReportValidator();
  constructor() {
    super();
  }
}
export default SalaryExpenseReportController;
