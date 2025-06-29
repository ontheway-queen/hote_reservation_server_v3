import AbstractRouter from "../../abstarcts/abstract.router";
import administratonController from "../controllers/administration.controller";

class AdministrationRouter extends AbstractRouter {
  public administratonController;

  constructor() {
    super();
    this.administratonController = new administratonController();
    this.callRouter();
  }

  private callRouter() {
    // this.router
    //   .route("/admin")
    //   .post(
    //     this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES),
    //     this.administratonController.createAdmin
    //   )
    //   .get(this.administratonController.getAllAdmin);

    // // update admin
    // this.router
    //   .route("/update/admin/:id")
    //   .patch(
    //     this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES),
    //     this.administratonController.updateAdmin
    //   );

    // // create permission
    this.router
      .route("/permission")
      .get(this.administratonController.getAllPermission);

    // // create role
    // this.router
    //   .route("/role")
    //   .post(this.administratonController.createRole)
    //   .get(this.administratonController.getRole);

    // // get single role
    // this.router
    //   .route("/role/:id")
    //   .get(this.administratonController.getSingleRole)
    //   .patch(this.administratonController.updateSingleRole);

    //create role, view role
    this.router
      .route("/role")
      .post(this.administratonController.createRole)
      .get(this.administratonController.roleList);

    //get role permissions, update role permissions
    this.router
      .route("/role/:id")
      .get(this.administratonController.getSingleRolePermission)
      .patch(this.administratonController.updateRolePermissions);

    //create admin, view admin
    this.router
      .route("/admin")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES),
        this.administratonController.createAdmin
      )
      .get(this.administratonController.getAllAdmin);

    //get single admin, update admin
    this.router
      .route("/admin/:id")
      .get(this.administratonController.getSingleAdmin)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_ADMIN_FILES),
        this.administratonController.updateAdmin
      );
  }
}

export default AdministrationRouter;
