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
                const { hotel_code, id } = req.hotel_admin;
                const _b = req.body, { deductions, allowances, account_id, total_days, gurranted_leave_days, basic_salary, employee_id } = _b, rest = __rest(_b, ["deductions", "allowances", "account_id", "total_days", "gurranted_leave_days", "basic_salary", "employee_id"]);
                const files = req.files || [];
                if (files.length) {
                    for (const { fieldname, filename } of files) {
                        req.body[fieldname] = filename;
                    }
                }
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const isEmployeeExists = yield employeeModel.getSingleEmployee(employee_id, hotel_code);
                if (!isEmployeeExists) {
                    throw new customEror_1.default("Employee with the related id not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ isEmployeeExists });
                const isPayrollExistsForMonth = yield model.hasPayrollForMonth({
                    employee_id: isEmployeeExists.id,
                    hotel_code,
                    payroll_month: rest.payroll_month,
                });
                if (isPayrollExistsForMonth) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                // Check account
                const checkAccount = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: account_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const daily_rate = Number(basic_salary) / total_days;
                const unpaid_leave_days = total_days - gurranted_leave_days;
                const payable_days = total_days - unpaid_leave_days;
                const total_unpaid_leave_deduction_amount = daily_rate * unpaid_leave_days;
                const payable_basic = daily_rate * payable_days;
                let totalDeductionsAmount = 0;
                let totalAllowancesAmount = 0;
                let deductionsPayload = [];
                if (deductions.length)
                    deductionsPayload = deductions.map((deduction) => {
                        const amount = Number(deduction.deduction_amount);
                        totalDeductionsAmount = totalDeductionsAmount + amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            deduction_name: deduction.deduction_name,
                            deduction_amount: amount,
                        };
                    });
                //  Handle Allowances
                let allowancesPayload = [];
                allowancesPayload = allowances.map((allowance) => {
                    const amount = Number(allowance.allowance_amount);
                    totalAllowancesAmount = totalAllowancesAmount + amount;
                    return {
                        employee_id,
                        allowance_name: allowance.allowance_name,
                        allowance_amount: amount,
                    };
                });
                const gross_salary = payable_basic + totalAllowancesAmount;
                const netSalary = gross_salary - totalDeductionsAmount || 0;
                console.log({ id });
                const payload = {
                    employee_id,
                    account_id,
                    payment_method: checkAccount[0].acc_type,
                    basic_salary,
                    payable_basic,
                    total_allowance: totalAllowancesAmount,
                    total_deduction: totalDeductionsAmount,
                    net_salary: netSalary,
                    gross_salary,
                    unpaid_leave_deduction: total_unpaid_leave_deduction_amount,
                    docs: req.body.docs,
                    leave_days: rest.leave_days,
                    unpaid_leave_days,
                    note: rest.note,
                    total_days,
                    payable_days,
                    daily_rate,
                    salary_date: rest.salary_date,
                    created_by: id,
                    hotel_code,
                    gurranted_leave_days,
                    payroll_month: rest.payroll_month,
                };
                const res = yield model.CreatePayRoll(payload);
                const payroll_id = (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id;
                console.log({ payroll_id });
                console.log({ deductionsPayload, deductions });
                if (deductionsPayload.length) {
                    const deductionsWithPayrollId = deductionsPayload.map((d) => (Object.assign(Object.assign({}, d), { payroll_id })));
                    yield model.createEmployeeDeductions(deductionsWithPayrollId);
                }
                if (allowancesPayload.length) {
                    const allowancesWithPayrollId = allowancesPayload.map((a) => (Object.assign(Object.assign({}, a), { payroll_id })));
                    yield model.createEmployeeAllowances(allowancesWithPayrollId);
                }
                // _____________________ Accounting __________________________//
                const helper = new helperFunction_1.HelperFunction();
                const hotelModel = this.Model.HotelModel(trx);
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "PAYROLL_HEAD_ID",
                ]);
                const payroll_head = heads.find((h) => h.config === "PAYROLL_HEAD_ID");
                if (!payroll_head) {
                    throw new Error("PAYROLL_HEAD_ID not configured for this hotel");
                }
                const voucher_no1 = yield helper.generateVoucherNo("JV", trx);
                const today = new Date().toISOString();
                console.log({ payroll_head });
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: payroll_head.head_id,
                        created_by: id,
                        debit: netSalary,
                        credit: 0,
                        description: `Expense for payroll`,
                        voucher_date: today,
                        voucher_no: voucher_no1,
                        hotel_code,
                    },
                ]);
                let voucher_type = "CCV";
                if (checkAccount[0].acc_type === "BANK") {
                    voucher_type = "BCV";
                }
                const voucher_no = yield helper.generateVoucherNo(voucher_type, trx);
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: checkAccount[0].acc_head_id,
                        created_by: id,
                        debit: 0,
                        credit: netSalary,
                        description: `Expense for payroll`,
                        voucher_date: today,
                        voucher_no,
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
            const { limit, skip, key, from_date, to_date } = req.query;
            const { data, total } = yield this.Model.payRollModel().getAllPayRoll({
                limit: limit,
                skip: skip,
                key: key,
                from_date: from_date,
                to_date: to_date,
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
                const { id } = req.params;
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const _a = req.body, { add_deductions, delete_deductions, add_allowances, delete_allowances, allowances, deductions, account_id, basic_salary, employee_id, leave_days, total_days, gurranted_leave_days, payroll_month } = _a, rest = __rest(_a, ["add_deductions", "delete_deductions", "add_allowances", "delete_allowances", "allowances", "deductions", "account_id", "basic_salary", "employee_id", "leave_days", "total_days", "gurranted_leave_days", "payroll_month"]);
                const files = req.files || [];
                if (files.length)
                    files.forEach(({ fieldname, filename }) => (req.body[fieldname] = filename));
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const existingPayroll = yield model.getSinglePayRoll(parseInt(id), hotel_code);
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
                const daily_rate = Number(basic_salary) / total_days;
                const unpaid_leave_days = total_days - gurranted_leave_days;
                const payable_days = total_days - unpaid_leave_days;
                const total_unpaid_leave_deduction_amount = daily_rate * unpaid_leave_days;
                const payable_basic = daily_rate * payable_days;
                let totalDeductionsAmount = 0;
                let totalAllowancesAmount = 0;
                if (add_deductions === null || add_deductions === void 0 ? void 0 : add_deductions.length) {
                    const deductionsPayload = add_deductions.map((deduction) => {
                        const amount = Number(deduction.deduction_amount);
                        totalDeductionsAmount = totalDeductionsAmount + amount;
                        return {
                            employee_id,
                            payroll_id: Number(id),
                            deduction_name: deduction.deduction_name,
                            deduction_amount: amount,
                        };
                    });
                    yield model.createEmployeeDeductions(deductionsPayload);
                }
                if (delete_deductions === null || delete_deductions === void 0 ? void 0 : delete_deductions.length) {
                    yield model.deleteEmployeeDeductionsByIds({
                        payroll_id: Number(id),
                        ids: delete_deductions,
                    });
                }
                if (add_allowances === null || add_allowances === void 0 ? void 0 : add_allowances.length) {
                    const allowancesPayload = add_allowances.map((allowance) => {
                        const amount = Number(allowance.allowance_amount);
                        totalAllowancesAmount = totalAllowancesAmount + amount;
                        return {
                            employee_id,
                            payroll_id: Number(id),
                            allowance_name: allowance.allowance_name,
                            allowance_amount: amount,
                        };
                    });
                    yield model.createEmployeeAllowances(allowancesPayload);
                }
                if (delete_allowances === null || delete_allowances === void 0 ? void 0 : delete_allowances.length) {
                    yield model.deleteEmployeeAllowancesByIds({
                        payroll_id: Number(id),
                        ids: delete_allowances,
                    });
                }
                const gross_salary = payable_basic + totalAllowancesAmount;
                const netSalary = gross_salary - totalDeductionsAmount;
                const payload = Object.assign(Object.assign({}, rest), { payment_method: account[0].acc_type, basic_salary,
                    employee_id,
                    payable_days,
                    daily_rate,
                    total_days,
                    leave_days, unpaid_leave_deduction: total_unpaid_leave_deduction_amount, account_id, total_allowance: totalAllowancesAmount, total_deduction: totalDeductionsAmount, gross_salary, net_salary: netSalary, updated_by: admin_id, hotel_code,
                    payroll_month });
                yield model.updatePayRoll({ id: parseInt(id), payload });
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