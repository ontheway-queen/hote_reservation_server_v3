import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantUnitController from "../controllers/unit.controller";

class RestaurantUnitRouter extends AbstractRouter {
	private controller = new RestaurantUnitController();

	constructor() {
		super();
		this.callV1Router();
	}

	private callV1Router() {
		this.router
			.route("/")
			.post(this.controller.createUnit)
			.get(this.controller.getUnits);

		this.router
			.route("/:id")
			.patch(this.controller.updateUnit)
			.delete(this.controller.deleteUnit);
	}
}

export default RestaurantUnitRouter;
