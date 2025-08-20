"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const report_expense_service_1 = __importDefault(require("../services/report.expense.service"));
const reports_validator_1 = __importDefault(require("../utlis/validator/reports.validator"));
class ExpenseReportController extends abstract_controller_1.default {
    constructor() {
        super();
        this.expenseReportService = new report_expense_service_1.default();
        this.reportvalidator = new reports_validator_1.default();
    }
}
exports.default = ExpenseReportController;
//# sourceMappingURL=report.expense.controller.js.map