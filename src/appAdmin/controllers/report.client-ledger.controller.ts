import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReportValidator from "../utlis/validator/reports.validator";
import clientLedgerReportService from "../services/report.client-ledger.service";

class ClientLedgerReportController extends AbstractController {
  private Service = new clientLedgerReportService();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }
}
export default ClientLedgerReportController;
