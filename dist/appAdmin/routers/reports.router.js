"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const report_controller_1 = __importDefault(require("../controllers/report.controller"));
const report_account_router_1 = __importDefault(require("./report.account.router"));
const report_client_ledger_router_1 = __importDefault(require("./report.client-ledger.router"));
const report_expense_router_1 = __importDefault(require("./report.expense.router"));
const report_salary_router_1 = __importDefault(require("./report.salary.router"));
class ReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.reportController = new report_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/account", new report_account_router_1.default().router);
        this.router.use("/expense", new report_expense_router_1.default().router);
        this.router.use("/salary", new report_salary_router_1.default().router);
        this.router.use("/client-ledger", new report_client_ledger_router_1.default().router);
        this.router
            .route("/hotel-statistics")
            .get(this.reportController.getHotelStatistics);
        this.router
            .route("/guest-report")
            .get(this.reportController.getGuestReport);
        this.router
            .route("/guest-ledger/by-guest/:id")
            .get(this.reportController.getSingleGuestLedger);
        this.router
            .route("/guest-distribution-countrywise")
            .get(this.reportController.getGuestDistributionCountryWise);
        this.router
            .route("/account-dashboard")
            .get(this.reportController.getAccountReport);
        this.router
            .route("/room_dashboard")
            .get(this.reportController.getRoomReport);
        this.router.get("/room-type-availability", this.reportController.getRoomReport);
    }
}
exports.default = ReportRouter;
//# sourceMappingURL=reports.router.js.map