import AbstractRouter from "../../abstarcts/abstract.router";
import EmployeeAllowancesController from "../controllers/employeeAllowances.controller";

class EmployeeAllowanceRouter extends AbstractRouter {
	private controller = new EmployeeAllowancesController();

	constructor() {
		super();

		this.callRouter();
	}
	private callRouter() {
		this.router.route("/").post(this.controller.createEmployeeAllowance);
		// .get(this.controller.getAllShifts);

		// this.router
		// 	.route("/shifts/:id")
		// 	.get(this.controller.getSingleShift)
		// 	.patch(this.controller.updateShift)
		// 	.delete(this.controller.deleteShift);
	}
}

export default EmployeeAllowanceRouter;
