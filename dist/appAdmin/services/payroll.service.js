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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const helperFunction_1 = require("../utlis/library/helperFunction");
class PayRollService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { deductions = [], allowances = [], account_id, total_days, granted_leave_days, total_attendance_days, basic_salary, employee_id, payroll_month, salary_date, note, } = req.body;
                (_a = req.files) === null || _a === void 0 ? void 0 : _a.forEach(({ fieldname, filename }) => (req.body[fieldname] = filename));
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const hotelModel = this.Model.HotelModel(trx);
                /** ---------------- Validate Employee & Payroll ---------------- */
                const employee = yield employeeModel.getSingleEmployee(employee_id, hotel_code);
                if (!employee) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee not found",
                    };
                }
                const hasPayroll = yield model.hasPayrollForMonth({
                    employee_id: employee.id,
                    hotel_code,
                    payroll_month,
                });
                if (hasPayroll) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                /** ---------------- Validate Account ---------------- */
                const account = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: account_id,
                });
                if (!account.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                /** ---------------- Salary Calculations ---------------- */
                const daily_rate = Number(basic_salary) / total_days;
                const unpaid_leave_days = total_days - granted_leave_days;
                const payable_days = total_attendance_days + granted_leave_days;
                const payable_basic = daily_rate * payable_days;
                const unpaid_leave_deduction = daily_rate * unpaid_leave_days;
                let total_deduction = 0;
                let total_allowance = 0;
                const deductionsPayload = deductions.map((d) => {
                    const amount = Number(d.deduction_amount);
                    total_deduction += amount;
                    return {
                        employee_id: employee.id,
                        deduction_name: d.deduction_name,
                        deduction_amount: amount,
                    };
                });
                const allowancesPayload = allowances.map((a) => {
                    const amount = Number(a.allowance_amount);
                    total_allowance += amount;
                    return {
                        employee_id,
                        allowance_name: a.allowance_name,
                        allowance_amount: amount,
                    };
                });
                const gross_salary = payable_basic + total_allowance;
                const net_salary = gross_salary - total_deduction;
                /** ---------------- Payroll Insert ---------------- */
                const payload = {
                    employee_id,
                    account_id,
                    payment_method: account[0].acc_type,
                    basic_salary,
                    payable_basic,
                    net_salary,
                    gross_salary,
                    unpaid_leave_deduction,
                    docs: req.body.docs,
                    leave_days: total_days - total_attendance_days,
                    unpaid_leave_days,
                    note,
                    total_days,
                    payable_days,
                    daily_rate,
                    salary_date,
                    created_by: admin_id,
                    hotel_code,
                    granted_leave_days,
                    payroll_month,
                    total_attendance_days,
                };
                const [{ id: payroll_id }] = yield model.CreatePayRoll(payload);
                if (deductionsPayload.length) {
                    yield model.createEmployeeDeductions(deductionsPayload.map((d) => (Object.assign(Object.assign({}, d), { payroll_id }))));
                }
                if (allowancesPayload.length) {
                    yield model.createEmployeeAllowances(allowancesPayload.map((a) => (Object.assign(Object.assign({}, a), { payroll_id }))));
                }
                /** ---------------- Accounting ---------------- */
                const helper = new helperFunction_1.HelperFunction();
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "PAYROLL_HEAD_ID",
                ]);
                const payroll_head = heads.find((h) => h.config === "PAYROLL_HEAD_ID");
                if (!payroll_head) {
                    throw new Error("PAYROLL_HEAD_ID not configured for this hotel");
                }
                const today = new Date().toISOString();
                // Debit expense
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: payroll_head.head_id,
                        created_by: admin_id,
                        debit: net_salary,
                        credit: 0,
                        description: `Expense for payroll`,
                        voucher_date: today,
                        voucher_no: yield helper.generateVoucherNo("JV", trx),
                        hotel_code,
                    },
                ]);
                // Credit account
                const voucher_type = account[0].acc_type === "BANK" ? "BCV" : "CCV";
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: account[0].acc_head_id,
                        created_by: admin_id,
                        debit: 0,
                        credit: net_salary,
                        description: `Expense for payroll`,
                        voucher_date: today,
                        voucher_no: yield helper.generateVoucherNo(voucher_type, trx),
                        hotel_code,
                    },
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Payroll created successfully.",
                };
            }));
        });
    }
    getAllPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date, payroll_month } = req.query;
            const { data, total } = yield this.Model.payRollModel().getAllPayRoll({
                limit: limit,
                skip: skip,
                key: key,
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                payroll_month: payroll_month,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSinglePayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.payRollModel().getSinglePayRoll(parseInt(id), hotel_code);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: `The requested payroll with ID: ${id} not found.`,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
    updatePayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id } = req.params;
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const _b = req.body, { add_deductions = [], delete_deductions = [], add_allowances = [], delete_allowances = [], allowances = [], deductions = [], account_id, basic_salary, employee_id, total_days, granted_leave_days, total_attendance_days, payroll_month } = _b, rest = __rest(_b, ["add_deductions", "delete_deductions", "add_allowances", "delete_allowances", "allowances", "deductions", "account_id", "basic_salary", "employee_id", "total_days", "granted_leave_days", "total_attendance_days", "payroll_month"]);
                // Attach file names if uploaded
                (_a = req.files) === null || _a === void 0 ? void 0 : _a.forEach(({ fieldname, filename }) => (req.body[fieldname] = filename));
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const existingPayroll = yield model.getSinglePayRoll(Number(id), hotel_code);
                if (!existingPayroll) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Payroll not found",
                    };
                }
                const employee = yield employeeModel.getSingleEmployee(existingPayroll.employee_id, hotel_code);
                if (!employee) {
                    throw new customEror_1.default("Employee not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const account = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: account_id,
                });
                if (!account.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                /** ---------------- Salary Calculations ---------------- */
                const daily_rate = Number(basic_salary) / total_days;
                const unpaid_leave_days = total_days - granted_leave_days;
                const payable_days = total_attendance_days + granted_leave_days;
                const payable_basic = daily_rate * payable_days;
                const unpaid_leave_deduction = daily_rate * unpaid_leave_days;
                let totalDeductionsAmount = 0;
                let totalAllowancesAmount = 0;
                /** ---------------- Update Existing Allowances ---------------- */
                if (allowances.length) {
                    totalAllowancesAmount += allowances.reduce((sum, a) => sum + Number(a.allowance_amount), 0);
                    yield Promise.all(allowances.map((_a) => {
                        var { id } = _a, payload = __rest(_a, ["id"]);
                        return model.updateEmployeeAllowances({ id, payload });
                    }));
                }
                /** ---------------- Update Existing Deductions ---------------- */
                if (deductions.length) {
                    totalDeductionsAmount += deductions.reduce((sum, d) => sum + Number(d.deduction_amount), 0);
                    yield Promise.all(deductions.map((_a) => {
                        var { id } = _a, payload = __rest(_a, ["id"]);
                        return model.updateEmployeeDeductions({ id, payload });
                    }));
                }
                /** ---------------- Add/Delete Deductions ---------------- */
                if (add_deductions.length) {
                    const deductionsPayload = add_deductions.map((d) => {
                        const amount = Number(d.deduction_amount);
                        totalDeductionsAmount += amount;
                        return Object.assign(Object.assign({ payroll_id: Number(id), employee_id }, d), { deduction_amount: amount });
                    });
                    yield model.createEmployeeDeductions(deductionsPayload);
                }
                if (delete_deductions.length) {
                    yield model.deleteEmployeeDeductionsByIds({
                        payroll_id: Number(id),
                        ids: delete_deductions,
                    });
                }
                /** ---------------- Add/Delete Allowances ---------------- */
                if (add_allowances.length) {
                    const allowancesPayload = add_allowances.map((a) => {
                        const amount = Number(a.allowance_amount);
                        totalAllowancesAmount += amount;
                        return Object.assign(Object.assign({ payroll_id: Number(id), employee_id }, a), { allowance_amount: amount });
                    });
                    yield model.createEmployeeAllowances(allowancesPayload);
                }
                if (delete_allowances.length) {
                    yield model.deleteEmployeeAllowancesByIds({
                        payroll_id: Number(id),
                        ids: delete_allowances,
                    });
                }
                /** ---------------- Final Salary Calculation ---------------- */
                const gross_salary = payable_basic + totalAllowancesAmount;
                const net_salary = gross_salary - totalDeductionsAmount;
                const payload = Object.assign(Object.assign({}, rest), { payment_method: account[0].acc_type, basic_salary,
                    employee_id,
                    payable_days,
                    daily_rate,
                    total_days, leave_days: total_days - total_attendance_days, unpaid_leave_deduction,
                    account_id,
                    gross_salary,
                    net_salary, updated_by: admin_id, hotel_code,
                    payroll_month,
                    granted_leave_days,
                    total_attendance_days });
                yield model.updatePayRoll({ id: Number(id), payload });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Payroll updated successfully.",
                };
            }));
        });
    }
    deletePayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const model = this.Model.payRollModel(trx);
                const existingPayroll = yield model.getSinglePayRoll(parseInt(id), hotel_code);
                if (!existingPayroll) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Payroll not found",
                    };
                }
                yield model.deletePayRoll({
                    id: parseInt(id),
                    payload: {
                        is_deleted: true,
                        deleted_by: admin_id,
                        deleted_at: new Date().toISOString(),
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Payroll deleted successfully",
                };
            }));
        });
    }
}
exports.default = PayRollService;
//# sourceMappingURL=payroll.service.js.map