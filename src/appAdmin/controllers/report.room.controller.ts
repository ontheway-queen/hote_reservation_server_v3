import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReportValidator from "../utlis/validator/reports.validator";
import RoomReportService from "../services/report.room.service";

class RoomReportController extends AbstractController {
  private roomReportService = new RoomReportService();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }
}
export default RoomReportController;
