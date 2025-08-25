import AbstractRouter from "../../abstarcts/abstract.router";
import EmployeeSettingController from "../controllers/employee.controller";

class EmployeeRouter extends AbstractRouter {
  private controller = new EmployeeSettingController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_EMPLOYEE_FILES),
        this.controller.createEmployee
      )
      .get(this.controller.getAllEmployee);

    this.router
      .route("/:id")
      .get(this.controller.getSingleEmployee)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_EMPLOYEE_FILES),
        this.controller.updateEmployee
      )
      .delete(this.controller.deleteEmployee);

    this.router
      .route("/by-department/:id")
      .get(this.controller.getEmployeesByDepartmentId);
  }
}

export default EmployeeRouter;
