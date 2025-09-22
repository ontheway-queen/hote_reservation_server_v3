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
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const helperFunction_1 = require("../utlis/library/helperFunction");
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
                console.log(1);
                // account check
                const [acc] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: rest.account_id,
                });
                if (!acc) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const getSingleEmployee = yield employeeModel.getSingleEmployee(rest.expense_by, hotel_code);
                console.log(2);
                if (!getSingleEmployee) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee not found",
                    };
                }
                const total_amount = expense_items.reduce((acc, cu) => acc + cu.amount, 0);
                console.log(3);
                // ___________________________________  Accounting _________________________________//
                // accounting
                const helper = new helperFunction_1.HelperFunction();
                const hotelModel = this.Model.HotelModel(trx);
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "HOTEL_EXPENSE_HEAD_ID",
                ]);
                const expense_head = heads.find((h) => h.config === "HOTEL_EXPENSE_HEAD_ID");
                if (!expense_head) {
                    throw new Error("HOTEL_EXPENSE_HEAD_ID not configured for this hotel");
                }
                if (!acc)
                    throw new Error("Invalid Account");
                let voucher_type = "DV";
                const voucher_no = yield helper.generateVoucherNo(voucher_type, trx);
                console.log(4);
                // generate expense no
                const expenseNo = yield lib_1.default.generateExpenseNo(trx);
                const vourcherRes = yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: expense_head.head_id,
                        created_by,
                        debit: total_amount,
                        credit: 0,
                        description: `Expense for ${expenseNo}`,
                        voucher_date: req.body.expense_date,
                        voucher_no,
                        hotel_code,
                    },
                    {
                        acc_head_id: acc.acc_head_id,
                        created_by,
                        debit: 0,
                        credit: total_amount,
                        description: `Expense for ${expenseNo}`,
                        voucher_date: new Date().toUTCString(),
                        voucher_no,
                        hotel_code,
                    },
                ]);
                //_______________________________________ END _________________________________//
                console.log(5);
                // Insert expense record
                const payload = Object.assign(Object.assign({}, rest), { expense_no: expenseNo, hotel_code,
                    created_by, expense_amount: total_amount, acc_voucher_id: vourcherRes[1].id });
                const expenseRes = yield model.createExpense(payload);
                const expenseItemPayload = expense_items.map((item) => {
                    return {
                        expense_head_id: item.expense_head_id,
                        remarks: item.remarks,
                        amount: item.amount,
                        expense_id: expenseRes[0].id,
                        ex_voucher_id: vourcherRes[0].id,
                    };
                });
                console.log(5.5);
                console.log({ expenseItemPayload });
                yield model.createExpenseItem(expenseItemPayload);
                console.log(6);
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
    updateExpenseService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { id: user_id, hotel_code } = req.hotel_admin;
                const _a = req.body, { expense_items } = _a, rest = __rest(_a, ["expense_items"]);
                console.log({ expense_items, data: rest });
                const expenseModel = this.Model.expenseModel(trx);
                const employeeModel = this.Model.employeeModel(trx);
                const [expense] = yield expenseModel.getSingleExpense(parseInt(id), hotel_code);
                if (!expense) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const expenseId = expense.id;
                if (Array.isArray(expense_items) && expense_items.length) {
                    const existingItems = yield expenseModel.getExpenseItemByExpenseId(expenseId);
                    const existingMap = new Map(existingItems.map((it) => [it.id, it]));
                    yield Promise.all(expense_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                        var _b;
                        const normalizedItem = Object.assign(Object.assign({}, item), { is_deleted: item.is_deleted === 1 ||
                                item.is_deleted === "1" });
                        if (item.id && existingMap.has(item.id)) {
                            yield expenseModel.updateExpenseItems({
                                id: item.id,
                                payload: normalizedItem,
                            });
                        }
                        else {
                            yield expenseModel.createExpenseItem(Object.assign({ expense_id: expenseId, expense_head_id: (_b = existingItems[0]) === null || _b === void 0 ? void 0 : _b.expense_head_id }, normalizedItem));
                        }
                    })));
                    const updatedItems = yield expenseModel.getExpenseItemByExpenseId(expenseId);
                    const totalAmount = updatedItems
                        .filter((item) => !item.is_deleted)
                        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
                    yield expenseModel.updateExpense({
                        id: expenseId,
                        hotel_code,
                        payload: { expense_amount: totalAmount },
                    });
                }
                const files = req.files;
                if (Array.isArray(files) && files.length) {
                    for (const file of files) {
                        const { fieldname, filename } = file;
                        if (fieldname === "file_1")
                            rest.expense_voucher_url_1 = filename;
                        if (fieldname === "file_2")
                            rest.expense_voucher_url_2 = filename;
                    }
                }
                if (rest && Object.keys(rest).length) {
                    if (rest.expense_by) {
                        const employee = yield employeeModel.getSingleEmployee(rest.expense_by, hotel_code);
                        if (!employee) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: this.ResMsg.HTTP_NOT_FOUND,
                            };
                        }
                    }
                    if (rest.account_id) {
                        const accountModel = this.Model.accountModel(trx);
                        const [acc] = yield accountModel.getSingleAccount({
                            hotel_code,
                            id: rest.account_id,
                        });
                        if (!acc) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "Account not found",
                            };
                        }
                    }
                    yield expenseModel.updateExpense({
                        id: Number(id),
                        hotel_code,
                        payload: Object.assign(Object.assign({}, rest), { updated_by: user_id, updated_at: new Date().toUTCString() }),
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteExpenseService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { id: user_id, hotel_code } = req.hotel_admin;
                const expenseModel = this.Model.expenseModel();
                const isExpenseExists = yield expenseModel.getSingleExpense(parseInt(id), hotel_code);
                if (!isExpenseExists.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const expenseItems = yield expenseModel.getExpenseItemByExpenseId(isExpenseExists[0].id);
                if (expenseItems.length) {
                    yield expenseModel.deleteExpenseItem(isExpenseExists[0].id);
                }
                const data = yield expenseModel.deleteExpense({
                    id: Number(id),
                    payload: {
                        hotel_code,
                        deleted_by: user_id,
                        is_deleted: true,
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.ExpenseService = ExpenseService;
exports.default = ExpenseService;
//# sourceMappingURL=expense.service.js.map