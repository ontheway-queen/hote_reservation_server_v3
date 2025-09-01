import AbstractRouter from "../../abstarcts/abstract.router";
import ConfigurationRouter from "./configuration.router";
import EmployeeRouter from "./employee.router";
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

		this.router.use(
			"/payroll-month",
			new PayrollMonthSettingRouter().router
		);

		this.router.use("/payroll", new PayRollRouter().router);

		this.router.use("/employee", new EmployeeRouter().router);

		this.router.use("/configuration", new ConfigurationRouter().router);
	}
}
export default HrRouter;
