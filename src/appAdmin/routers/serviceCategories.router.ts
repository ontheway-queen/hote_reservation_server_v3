import AbstractRouter from "../../abstarcts/abstract.router";
import ServiceCategoriesController from "../controllers/serviceCategories.controller";

class ServiceCategoriesRouter extends AbstractRouter {
	private controller = new ServiceCategoriesController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(this.controller.createServiceCategory)
			.get(this.controller.getAllServiceCategories);

		this.router
			.route("/:id")
			.patch(this.controller.updateServiceCategory)
			.delete(this.controller.deleteServiceCategory);
	}
}
export default ServiceCategoriesRouter;
