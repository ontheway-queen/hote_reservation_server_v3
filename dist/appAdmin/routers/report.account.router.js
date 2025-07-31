"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const report_account_controller_1 = __importDefault(require("../controllers/report.account.controller"));
class AccountReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.reportController = new report_account_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //<sabbir.m360ict@gmail.com> ---- Sabbir Hosen;
        // Account Reports
        this.router.get("/journal", this.reportController.getJournalReport);
        this.router.get("/ledger", this.reportController.getAccLedger);
        this.router.get("/trail-balance", this.reportController.getTrialBalanceReport);
        this.router.get("/income-statement", this.reportController.getIncomeStatement);
        this.router.get("/balance-sheet", this.reportController.getBalanceSheet);
        this.router.get("/head-select", this.reportController.getAccHeadsForSelect);
    }
}
exports.default = AccountReportRouter;
//# sourceMappingURL=report.account.router.js.map