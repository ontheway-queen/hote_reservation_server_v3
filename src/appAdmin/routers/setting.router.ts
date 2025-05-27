import AbstractRouter from "../../abstarcts/abstract.router";
import HotelRouter from "./hotel.router";
import BankNameRouter from "./setting.bankname.router";
import DepartmentSettingRouter from "./setting.department.router";
import DesignationSettingRouter from "./setting.designation.router";
import EmployeeSettingRouter from "./setting.employee.router";
import HallSettingRouter from "./setting.hall.router";
import PayrollMonthSettingRouter from "./setting.payroll-month.router";
import RoomSettingRouter from "./setting.room.router";
import RoomRatesRouter from "./setting.room_rates.router ";
import SettingRootRouter from "./setting.root.router";

class SettingRouter extends AbstractRouter {
  constructor() {
    super();

    this.callRouter();
  }
  private callRouter() {
    this.router.use("/", new SettingRootRouter().router);

    this.router.use("/hotel", new HotelRouter().router);

    this.router.use("/room-rates", new RoomRatesRouter().router);

    this.router.use("/room", new RoomSettingRouter().router);

    this.router.use("/bank-name", new BankNameRouter().router);

    this.router.use("/department", new DepartmentSettingRouter().router);

    this.router.use("/designation", new DesignationSettingRouter().router);

    this.router.use("/employee", new EmployeeSettingRouter().router);

    this.router.use("/hall", new HallSettingRouter().router);

    this.router.use("/payroll-month", new PayrollMonthSettingRouter().router);
  }
}
export default SettingRouter;
