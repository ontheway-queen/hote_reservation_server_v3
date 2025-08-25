"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const setting_payroll_month_controller_1 = __importDefault(require("../controllers/setting.payroll-month.controller"));
class PayrollMonthSettingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new setting_payroll_month_controller_1.default();
        this.callRouter();
    }
    callRouter() {
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
exports.default = PayrollMonthSettingRouter;
//# sourceMappingURL=setting.payroll-month.router.js.map