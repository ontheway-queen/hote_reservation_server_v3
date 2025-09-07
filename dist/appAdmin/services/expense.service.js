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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class ExpenseService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAllExpenseHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.expenseModel().getExpenseHeads({
                search: req.query.search,
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    createExpense(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: created_by } = req.hotel_admin;
                const _a = req.body, { expense_items } = _a, rest = __rest(_a, ["expense_items"]);
                const files = req.files;
                if (Array.isArray(files) && files.length) {
                    files.forEach((file) => {
                        const { fieldname, filename } = file;
                        switch (fieldname) {
                            case "file_1":
                                rest.expense_voucher_url_1 = filename;
                                break;
                            case "file_2":
                                rest.expense_voucher_url_2 = filename;
                                break;
                        }
                    });
                }
                const accountModel = this.Model.accountModel(trx);
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.expenseModel(trx);
                // account check
                const checkAccount = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: rest.account_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const getSingleEmployee = yield employeeModel.getSingleEmployee(rest.expense_by, hotel_code);
                if (!getSingleEmployee) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee not found",
                    };
                }
                const year = new Date().getFullYear();
                const expenseId = yield model.getExpenseLastId();
                const expenseNo = expenseId.length ? expenseId[0].id + 1 : 1;
                const total_amount = expense_items.reduce((acc, cu) => acc + cu.amount, 0);
                // Insert expense record
                const payload = Object.assign(Object.assign({}, rest), { expense_no: `EXP-${year}${expenseNo}`, hotel_code,
                    created_by, expense_amount: total_amount, acc_voucher_id: 77 });
                const expenseRes = yield model.createExpense(payload);
                const expenseItemPayload = expense_items.map((item) => {
                    return {
                        expense_head_id: item.id,
                        remarks: item.remarks,
                        amount: item.amount,
                        expense_id: expenseRes[0].id,
                    };
                });
                yield model.createExpenseItem(expenseItemPayload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Expense created successfully.",
                };
            }));
        });
    }
    getAllExpense(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { from_date, to_date, limit, skip, key } = req.query;
            const { data, total } = yield this.Model.expenseModel().getAllExpense({
                from_date: from_date,
                to_date: to_date,
                limit: limit,
                skip: skip,
                key: key,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleExpense(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.expenseModel().getSingleExpense(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
}
exports.ExpenseService = ExpenseService;
exports.default = ExpenseService;
//# sourceMappingURL=expense.service.js.map