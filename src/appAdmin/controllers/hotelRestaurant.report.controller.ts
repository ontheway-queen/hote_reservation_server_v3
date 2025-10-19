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
			const { code, ...data } =
				await this.service.getRestaurantSalesReport(req);
			res.status(code).json(data);
		}
	);
}

export default HotelRestaurantReportController;
