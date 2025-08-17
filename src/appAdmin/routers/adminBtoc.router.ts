import AbstractRouter from "../../abstarcts/abstract.router";
import AdminBtocController from "../controllers/adminBtoc.controller";

class AdminBtocRouter extends AbstractRouter {
	private controller = new AdminBtocController();
	constructor() {
		super();

		this.callRouter();
	}
	private callRouter() {
		// update hotel b2c site config
		this.router
			.route("configuration")
			.patch(this.controller.updateSiteConfiguration);
	}
}
export default AdminBtocRouter;
