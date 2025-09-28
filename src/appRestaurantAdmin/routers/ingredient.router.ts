import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantIngredientController from "../controllers/ingredient.controller";

class RestaurantIngredientRouter extends AbstractRouter {
	private controller = new RestaurantIngredientController();

	constructor() {
		super();
		this.callV1Router();
	}

	private callV1Router() {
		this.router
			.route("/")
			.post(this.controller.createMeasurement)
			.get(this.controller.getIngredients);

		this.router
			.route("/:id")
			.patch(this.controller.updateIngredient)
			.delete(this.controller.deleteIngredient);
	}
}

export default RestaurantIngredientRouter;
