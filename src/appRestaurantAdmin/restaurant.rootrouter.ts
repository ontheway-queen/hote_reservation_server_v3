import { Router } from "express";
import AuthChecker from "../common/middleware/authChecker/authChecker";
import RestaurantIngredientRouter from "./routers/ingredient.router";
import RestaurantMeasurementRouter from "./routers/measurement.router";
import RestaurantMenuCategoryRouter from "./routers/menuCategory.router";
import RestaurantTableRouter from "./routers/restaurantTable.router";

export class RestaurantRootRouter {
	public router = Router();
	public authChecker = new AuthChecker();

	constructor() {
		this.callRouter();
	}

	private callRouter() {
		this.router.use(
			"/table",
			this.authChecker.hotelRestaurantAuthChecker,
			new RestaurantTableRouter().router
		);

		this.router.use(
			"/menu-category",
			this.authChecker.hotelRestaurantAuthChecker,
			new RestaurantMenuCategoryRouter().router
		);

		this.router.use(
			"/measurement",
			this.authChecker.hotelRestaurantAuthChecker,
			new RestaurantMeasurementRouter().router
		);

		this.router.use(
			"/ingredient",
			this.authChecker.hotelRestaurantAuthChecker,
			new RestaurantIngredientRouter().router
		);
	}
}
