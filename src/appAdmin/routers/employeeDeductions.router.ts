import AbstractRouter from "../../abstarcts/abstract.router";
import EmployeeDeductionsController from "../controllers/employeeDeductions.controller";

class EmployeeDeductionsRouter extends AbstractRouter {
	private controller = new EmployeeDeductionsController();

	constructor() {
		super();

		this.callRouter();
	}
	private callRouter() {
		this.router.route("/").post(this.controller.createEmployeeDeduction);
		// .get(this.controller.getAllShifts);

		// this.router
		// 	.route("/shifts/:id")
		// 	.get(this.controller.getSingleShift)
		// 	.patch(this.controller.updateShift)
		// 	.delete(this.controller.deleteShift);
	}
}

export default EmployeeDeductionsRouter;
