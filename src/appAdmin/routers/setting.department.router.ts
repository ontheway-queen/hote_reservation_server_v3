import AbstractRouter from "../../abstarcts/abstract.router";
import DepartmentSettingController from "../controllers/setting.department.controller";

class DepartmentSettingRouter extends AbstractRouter {
  private departmentSettingController = new DepartmentSettingController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(this.departmentSettingController.createDepartment)
      .get(this.departmentSettingController.getAllDepartment);

    this.router
      .route("/:id")
      .get(this.departmentSettingController.getSingleDepartment)
      .patch(this.departmentSettingController.updateDepartment)
      .delete(this.departmentSettingController.deleteDepartment);
  }
}
export default DepartmentSettingRouter;
