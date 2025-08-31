import AbstractRouter from "../../abstarcts/abstract.router";
import ConfigurationController from "../controllers/configuration.controller";

class ConfigurationRouter extends AbstractRouter {
	private controller = new ConfigurationController();

	constructor() {
		super();

		this.callRouter();
	}
	private callRouter() {
		// Shifts
		this.router
			.route("/shifts")
			.post(this.controller.createShift)
			.get(this.controller.getAllShifts);

		this.router
			.route("/shifts/:id")
			.get(this.controller.getSingleShift)
			.patch(this.controller.updateShift)
			.delete(this.controller.deleteShift);

		// Allowances
		this.router
			.route("/allowances")
			.post(this.controller.createAllowances)
			.get(this.controller.getAllAllowances);

		this.router
			.route("/allowances/:id")
			.get(this.controller.getSingleAllowance)
			.patch(this.controller.updateAllowance)
			.delete(this.controller.deleteAllowance);

		// Deductions
		this.router
			.route("/deductions")
			.post(this.controller.createDeductions)
			.get(this.controller.getAllDeductions);

		this.router
			.route("/deductions/:id")
			.get(this.controller.getSingleDeduction)
			.patch(this.controller.updateDeduction)
			.delete(this.controller.deleteDeduction);
	}
}

export default ConfigurationRouter;
