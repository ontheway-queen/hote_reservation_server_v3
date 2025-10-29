import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import HotelRestaurantReportService from "../services/hotelRestaurant.report.service";
import HotelRestaurantReportValidator from "../utlis/validator/hotelRestaurant.report.validator";

class HotelRestaurantReportController extends AbstractController {
  private service = new HotelRestaurantReportService();
  private validator = new HotelRestaurantReportValidator();

  constructor() {
    super();
  }

  public getRestaurantSalesReport = this.asyncWrapper.wrap(
    { querySchema: this.validator.getRestaurantSalesReport },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSalesReport(req);
      res.status(code).json(data);
    }
  );

  public getOrderInfo = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getOrderInfo(req);
      res.status(code).json(data);
    }
  );

  public getDailyOrderCounts = this.asyncWrapper.wrap(
    { querySchema: this.validator.getDailyReportValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getDailyOrderCounts(req);
      res.status(code).json(data);
    }
  );

  public getProductsReport = this.asyncWrapper.wrap(
    { querySchema: this.validator.getProductsReportValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getProductsReport(req);
      res.status(code).json(data);
    }
  );

  public getSalesChart = this.asyncWrapper.wrap(
    { querySchema: this.validator.getDailyReportValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSalesChart(req);
      res.status(code).json(data);
    }
  );

  public getProductCategoryWiseReport = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getProductCategoryWiseReport(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSalesReport = this.asyncWrapper.wrap(
    { querySchema: this.validator.getRestaurantSalesReport },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSalesReport(req);
      res.status(code).json(data);
    }
  );

  public getUserSalesReport = this.asyncWrapper.wrap(
    { querySchema: this.validator.getUsersSaleReportValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getUserSalesReport(req);
      res.status(code).json(data);
    }
  );
}

export default HotelRestaurantReportController;
