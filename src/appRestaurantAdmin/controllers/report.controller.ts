import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantReportService from "../services/report.service";
import RestaurantReportValidator from "../utils/validator/report.validator";

class RestaurantReportController extends AbstractController {
	private service = new RestaurantReportService();
	private validator = new RestaurantReportValidator();

	constructor() {
		super();
	}

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
			const { code, ...data } = await this.service.getDailyOrderCounts(
				req
			);
			res.status(code).json(data);
		}
	);

	public getHourlyOrders = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getDailyReportValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getHourlyOrders(req);
			res.status(code).json(data);
		}
	);

	public getSellingItems = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSellingItems(req);
			res.status(code).json(data);
		}
	);

	public getSellsReport = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getDailyReportValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSellsReport(req);
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

	public getUserSellsReport = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getUserSellsReport(
				req
			);
			res.status(code).json(data);
		}
	);
}

export default RestaurantReportController;
