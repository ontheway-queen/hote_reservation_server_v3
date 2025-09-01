import AbstractRouter from "../../abstarcts/abstract.router";
import HRConfigurationRouter from "./configuration.router";
import EmployeeRouter from "./employee.router";
import EmployeeAllowanceRouter from "./employeeAllowances.router";
import EmployeeDeductionsRouter from "./employeeDeductions.router";
import PayRollRouter from "./payRoll.router";
import DepartmentSettingRouter from "./setting.department.router";
import DesignationSettingRouter from "./setting.designation.router";
import PayrollMonthSettingRouter from "./setting.payroll-month.router";

class HrRouter extends AbstractRouter {
  constructor() {
    super();

    this.callRouter();
  }
  private callRouter() {
    this.router.use("/department", new DepartmentSettingRouter().router);

    this.router.use("/designation", new DesignationSettingRouter().router);

    this.router.use("/payroll-month", new PayrollMonthSettingRouter().router);

    this.router.use("/payroll", new PayRollRouter().router);

    this.router.use("/employee", new EmployeeRouter().router);

    this.router.use("/configuration", new HRConfigurationRouter().router);

    this.router.use(
      "/employee-allowances",
      new EmployeeAllowanceRouter().router
    );

    this.router.use(
      "/employee-deductions",
      new EmployeeDeductionsRouter().router
    );
  }
}
export default HrRouter;
