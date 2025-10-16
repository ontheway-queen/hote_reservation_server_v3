import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantStaffController from "../controllers/staff.controller";

class RestaurantStaffRouter extends AbstractRouter {
	private controller = new RestaurantStaffController();

	constructor() {
		super();
		this.callV1Router();
	}

	private callV1Router() {
		this.router.route("/").get(this.controller.getAllStaffs);

		this.router.route("/:id").get(this.controller.getSingleStaff);
	}
}

export default RestaurantStaffRouter;
