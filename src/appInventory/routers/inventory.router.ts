import AbstractRouter from "../../abstarcts/abstract.router";
import InventoryController from "../controllers/inventory.controller";

class InventoryRouter extends AbstractRouter {
	private controller = new InventoryController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getInventoryDetailsController);

		this.router
			.route("/:id")
			.get(this.controller.getSingleInventoryDetailsController);
	}
}
export default InventoryRouter;
