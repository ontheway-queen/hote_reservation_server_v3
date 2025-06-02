"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const report_salary_service_1 = __importDefault(require("../services/report.salary.service"));
const reports_validator_1 = __importDefault(require("../utlis/validator/reports.validator"));
class SalaryExpenseReportController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new report_salary_service_1.default();
        this.salaryReportValidator = new reports_validator_1.default();
    }
}
exports.default = SalaryExpenseReportController;
//# sourceMappingURL=report.salary.controller.js.map