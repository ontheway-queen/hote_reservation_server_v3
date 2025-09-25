import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantMeasurementController from "../controllers/measurement.controller";

class RestaurantMeasurementRouter extends AbstractRouter {
	private controller = new RestaurantMeasurementController();

	constructor() {
		super();
		this.callV1Router();
	}

	private callV1Router() {
		this.router
			.route("/")
			.post(this.controller.createMeasurement)
			.get(this.controller.getMeasurements);

		this.router
			.route("/:id")
			.patch(this.controller.updateMeasurement)
			.delete(this.controller.deleteMeasurement);
	}
}

export default RestaurantMeasurementRouter;
