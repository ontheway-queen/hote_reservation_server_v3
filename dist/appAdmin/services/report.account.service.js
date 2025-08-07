"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountReportService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const account_utils_1 = __importDefault(require("../utlis/library/account.utils"));
const constants_1 = require("../../utils/miscellaneous/constants");
class AccountReportService extends abstract_service_1.default {
    constructor() {
        super();
        this.getJournalReport = (req) => __awaiter(this, void 0, void 0, function* () {
            const journals = yield this.Model.reportModel().getAccountsTransactions(Object.assign(Object.assign({}, req.query), { hotel_code: req.hotel_admin.hotel_code }));
            const data = account_utils_1.default.formatJournal(journals);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
        this.getAccLedger = (req) => __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, head_id } = req.query;
            const hotel_code = req.hotel_admin.hotel_code;
            const headSet = new Set();
            const headIds = [];
            const model = this.Model.reportModel();
            const headInfo = yield model.getAccHeadInfo(Number(head_id), hotel_code);
            if (!headInfo) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No Account Found",
                };
            }
            headIds.push(Number(head_id));
            headSet.add(Number(head_id));
            const heads = yield model.getAccHeads(hotel_code);
            for (const head of heads) {
                if (headSet.has(head.parent_id)) {
                    headSet.add(head.id);
                    headIds.push(head.id);
                }
            }
            const ledgers = yield model.getAccountsTransactions({
                headIds,
                from_date,
                to_date,
                hotel_code: req.hotel_admin.hotel_code,
            });
            console.log({ ledgers });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, headInfo), { ledgers }),
            };
        });
        this.getTrialBalanceReport = (req) => __awaiter(this, void 0, void 0, function* () {
            const payload = yield this.Model.reportModel().getTrialBalanceReport(Object.assign(Object.assign({}, req.query), { hotel_code: req.hotel_admin.hotel_code }));
            const data = account_utils_1.default.formatTrialBalance(payload);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
        this.getIncomeStatement = (req) => __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date } = req.query;
            const model = this.Model.reportModel();
            const incomeData = yield model.getTrialBalanceReport({
                from_date,
                to_date,
                group_code: constants_1.INCOME_GROUP,
                hotel_code: req.hotel_admin.hotel_code,
            });
            const formattedIncomeData = account_utils_1.default.formatTrialBalance(incomeData);
            let incomeDebit = 0;
            let incomeCredit = 0;
            formattedIncomeData.forEach((item) => {
                incomeDebit += item.debit_balance;
                incomeCredit += item.credit_balance;
            });
            const expenseData = yield model.getTrialBalanceReport({
                group_code: constants_1.EXPENSE_GROUP,
                from_date,
                to_date,
                hotel_code: req.hotel_admin.hotel_code,
            });
            const formattedExpenseData = account_utils_1.default.formatTrialBalance(expenseData);
            let expenseDebit = 0;
            let expenseCredit = 0;
            formattedExpenseData.forEach((item) => {
                expenseDebit += item.debit_balance;
                expenseCredit += item.credit_balance;
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    profitLoss: incomeCredit - incomeDebit - (expenseDebit - expenseCredit),
                    income: {
                        totalDebit: incomeDebit,
                        totalCredit: incomeCredit,
                        heads: formattedIncomeData,
                    },
                    expense: {
                        totalDebit: expenseDebit,
                        totalCredit: expenseCredit,
                        heads: formattedExpenseData,
                    },
                },
            };
        });
        this.getBalanceSheet = (req) => __awaiter(this, void 0, void 0, function* () {
            const conn = this.Model.reportModel();
            const data = yield conn.getTrialBalanceReport(Object.assign(Object.assign({}, req.query), { hotel_code: req.hotel_admin.hotel_code }));
            const formattedData = account_utils_1.default.formatTrialBalance(data);
            const assets = [];
            const liabilities = [];
            const capitals = [];
            const income = [];
            const expense = [];
            const dividend = [];
            for (const item of formattedData) {
                if (item.group_code === constants_1.ASSET_GROUP) {
                    assets.push(item);
                }
                else if (item.group_code === constants_1.LIABILITY_GROUP) {
                    liabilities.push(item);
                }
                else if (item.group_code === constants_1.CAPITAL_GROUP) {
                    capitals.push(item);
                }
                else if (item.group_code === constants_1.INCOME_GROUP) {
                    income.push(item);
                }
                else if (item.group_code === constants_1.EXPENSE_GROUP) {
                    expense.push(item);
                }
                else if (item.group_code === constants_1.DIVIDEND_GROUP) {
                    dividend.push(item);
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    assets,
                    liabilities,
                    capitals,
                    income,
                    expense,
                    dividend,
                },
            };
        });
        this.getAccHeadsForSelect = (req) => __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.reportModel();
            const data = yield model.getAccHeadsForSelect(req.hotel_admin.hotel_code);
            const headMap = new Map();
            console.log({ data });
            // Step 2: Populate the map with heads
            for (const item of data) {
                headMap.set(item.head_id, {
                    head_id: item.head_id,
                    head_parent_id: item.head_parent_id,
                    head_code: item.head_code,
                    head_group_code: item.head_group_code,
                    head_name: item.head_name,
                    parent_head_code: item.parent_head_code,
                    parent_head_name: item.parent_head_name,
                    children: [],
                });
            }
            // Step 3: Build the hierarchy
            const rootHeads = [];
            for (const head of headMap.values()) {
                if (head.head_parent_id === null) {
                    // This is a root-level head
                    rootHeads.push(head);
                }
                else {
                    // Find the parent head
                    const parentHead = headMap.get(head.head_parent_id);
                    if (parentHead) {
                        // Add this head as a child of the parent
                        parentHead.children.push(head);
                    }
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: rootHeads,
            };
        });
    }
}
exports.AccountReportService = AccountReportService;
exports.default = AccountReportService;
//# sourceMappingURL=report.account.service.js.map