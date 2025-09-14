import AbstractRouter from "../../abstarcts/abstract.router";
import PayRollController from "../controllers/payRoll.controller";

class PayRollRouter extends AbstractRouter {
	private controller = new PayRollController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(
				this.uploader.cloudUploadRaw(
					this.fileFolders.HOTEL_PAYROLL_FILES
				),
				this.controller.createPayRoll
			)
			.get(this.controller.getAllPayRoll);

		this.router
			.route("/:id")
			.get(this.controller.getSinglePayRoll)
			.patch(
				this.uploader.cloudUploadRaw(
					this.fileFolders.HOTEL_PAYROLL_FILES
				),
				this.controller.updatePayRollController
			)
			.delete(this.controller.deletePayRollController);
	}
}
export default PayRollRouter;
