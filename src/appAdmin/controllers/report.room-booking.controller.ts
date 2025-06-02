import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReportValidator from "../utlis/validator/reports.validator";
import RoomBookingReportService from "../services/report.room-booking.service";

class RoomBookingReportController extends AbstractController {
  private roomBookingReportService = new RoomBookingReportService();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }
}
export default RoomBookingReportController;
