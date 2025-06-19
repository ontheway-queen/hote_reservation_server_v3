import AbstractRouter from "../../abstarcts/abstract.router";
import MAdministrationController from "../controllers/mAdmin.administration.controller";

class MAdministrationRouter extends AbstractRouter {
  public administratonController;

  constructor() {
    super();
    this.administratonController = new MAdministrationController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/admin")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
        this.administratonController.createAdmin
      )
      .get(this.administratonController.getAllAdmin);

    // update admin
    this.router
      .route("/update/admin/:id")
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
        this.administratonController.updateAdmin
      );
  }
}

export default MAdministrationRouter;
