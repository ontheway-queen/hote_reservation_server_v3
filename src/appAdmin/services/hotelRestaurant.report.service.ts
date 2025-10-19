import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class HotelRestaurantReportService extends AbstractServices {
	constructor() {
		super();
	}

	public async getRestaurantSalesReport(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { from_date, to_date, order_type, limit, skip, restaurant_id } =
			req.query;
		const { data, total, totals } = await this.restaurantModel
			.restaurantReportModel()
			.getSalesReport({
				from_date: from_date as string,
				to_date: to_date as string,
				hotel_code,
				restaurant_id: Number(restaurant_id),
				order_type: order_type as string,
				limit: limit as string,
				skip: skip as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			totals,
			data,
		};
	}
}

export default HotelRestaurantReportService;
