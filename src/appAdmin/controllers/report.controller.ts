import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ReportService from "../services/report.dashBoard.service";
import DashBoardValidator from "../utlis/validator/dashboard.validator";
import ReportValidator from "../utlis/validator/reports.validator";

class ReportController extends AbstractController {
  private reportService = new ReportService();
  private dashBoardValidator = new DashBoardValidator();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }

  public getHotelStatistics = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.getHotelStatistics(
        req
      );

      res.status(code).json(data);
    }
  );

  public getGuestReport = this.asyncWrapper.wrap(
    { querySchema: this.dashBoardValidator.getGuestReport },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.getGuestReport(req);
      res.status(code).json(data);
    }
  );

  public inhouseGuestListReport = this.asyncWrapper.wrap(
    {
      querySchema:
        this.dashBoardValidator.getGuegetInhouseGuestListReportstReport,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.inhouseGuestListReport(
        req
      );
      res.status(code).json(data);
    }
  );

  public departureRoomListReport = this.asyncWrapper.wrap(
    {
      querySchema: this.dashBoardValidator.departureRoomListReport,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.reportService.departureRoomListReport(req);
      res.status(code).json(data);
    }
  );

  public arrivalRoomListReport = this.asyncWrapper.wrap(
    {
      querySchema: this.dashBoardValidator.departureRoomListReport,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.arrivalRoomListReport(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSingleGuestLedger = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.getSingleGuestLedger(
        req
      );
      res.status(code).json(data);
    }
  );

  public getGuestDistributionCountryWise = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.reportService.getGuestDistributionCountryWise(req);

      res.status(code).json(data);
    }
  );

  public getAccountReport = this.asyncWrapper.wrap(
    { querySchema: this.dashBoardValidator.getAllAccountQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.getAccountReport(req);

      res.status(code).json(data);
    }
  );

  public getAllReservationByRoom = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.getAllReservationByRoom },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.reportService.getAllReservationByRoom(req);

      res.status(code).json(data);
    }
  );

  public getRoomReport = this.asyncWrapper.wrap(
    { querySchema: this.dashBoardValidator.getAllRoomsQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.reportService.getRoomReport(req);

      res.status(code).json(data);
    }
  );
}
export default ReportController;
