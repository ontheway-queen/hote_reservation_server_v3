import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReportValidator from "../utlis/validator/reports.validator";
import HallBookingReportService from "../services/report.hall_booking.service";

class HallBookingReportController extends AbstractController {
  private hallBookingReportService = new HallBookingReportService();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }
}
export default HallBookingReportController;
