import AbstractRouter from "../../abstarcts/abstract.router";
import HotelRestaurantReportController from "../controllers/hotelRestaurant.report.controller";

class HotelRestaurantReportRouter extends AbstractRouter {
	private controller = new HotelRestaurantReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/sales-report")
			.get(this.controller.getRestaurantSalesReport);
	}
}

export default HotelRestaurantReportRouter;
