import AbstractRouter from "../../abstarcts/abstract.router";
import ResAdministrationController from "../controllers/res.administration.controller";

class ResAdministrationRouter extends AbstractRouter {
  public administratonController;

  constructor() {
    super();
    this.administratonController = new ResAdministrationController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/permission")
      .get(this.administratonController.getAllPermission);

    this.router
      .route("/role")
      .post(this.administratonController.createRole)
      .get(this.administratonController.getAllRole);

    this.router
      .route("/role/:id")
      .get(this.administratonController.getSingleRole)
      .patch(this.administratonController.updateSingleRole);

    this.router
      .route("/admin")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.RES_ADMIN_FILES),
        this.administratonController.createAdmin
      )
      .get(this.administratonController.getAllAdmin);

    this.router
      .route("/admin/:id")
      .get(this.administratonController.getSingleAdmin)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.RES_ADMIN_FILES),
        this.administratonController.updateAdmin
      );
  }
}

export default ResAdministrationRouter;
