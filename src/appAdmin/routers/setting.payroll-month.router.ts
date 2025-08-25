import AbstractRouter from "../../abstarcts/abstract.router";
import PayrollMonthSettingController from "../controllers/setting.payroll-month.controller";

class PayrollMonthSettingRouter extends AbstractRouter {
  private Controller = new PayrollMonthSettingController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(this.Controller.createPayrollMonths)
      .get(this.Controller.getAllPayrollMonths);

    this.router
      .route("/:id")
      .patch(this.Controller.updatePayrollMonths)
      .delete(this.Controller.deletePayrollMonths);
  }
}
export default PayrollMonthSettingRouter;
