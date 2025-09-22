import AbstractRouter from "../../abstarcts/abstract.router";
import ServiceController from "../controllers/service.controller";

class ServiceRouter extends AbstractRouter {
	private controller = new ServiceController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(
				this.uploader.cloudUploadRaw(
					this.fileFolders.HOTEL_SERVICE_FILES
				),
				this.controller.createService
			)
			.get(this.controller.getAllServices);

		this.router
			.route("/:id")
			.get(this.controller.getSingleService)
			.delete(this.controller.deleteService)
			.patch(
				this.uploader.cloudUploadRaw(
					this.fileFolders.HOTEL_SERVICE_FILES
				),
				this.controller.updateService
			);
	}
}
export default ServiceRouter;
