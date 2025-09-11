"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const expense_controller_1 = __importDefault(require("../controllers/expense.controller"));
class ExpenseRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.expenseController = new expense_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/head")
            .get(this.expenseController.getAllExpenseHead);
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.EXPENSE_FILES), this.expenseController.createExpense)
            .get(this.expenseController.getAllExpense);
        this.router
            .route("/:id")
            .get(this.expenseController.getSingleExpense)
            .delete(this.expenseController.deleteExpenseController)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.EXPENSE_FILES), this.expenseController.updateExpenseController);
    }
}
exports.default = ExpenseRouter;
//# sourceMappingURL=expense.router.js.map