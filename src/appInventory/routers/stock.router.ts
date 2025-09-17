import AbstractRouter from "../../abstarcts/abstract.router";
import StockInvController from "../controllers/stock.controller";

class StockInvRouter extends AbstractRouter {
	private controller = new StockInvController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		//=================== stock ======================//

		// stock
		this.router
			.route("/")
			.post(this.controller.createStock)
			.get(this.controller.getAllStock);

		// single Stock
		this.router
			.route("/:id")
			.get(this.controller.getSingleStock)
			.patch(this.controller.updateStockController);
	}
}
export default StockInvRouter;
