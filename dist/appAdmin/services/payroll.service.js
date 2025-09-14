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
class PayRollService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Payroll Service ======================//
    createPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { hotel_code, id } = req.hotel_admin;
                const _c = req.body, { deductions, allowances, account_id } = _c, rest = __rest(_c, ["deductions", "allowances", "account_id"]);
                const files = req.files || [];
                if (files.length) {
                    for (const { fieldname, filename } of files) {
                        rest[fieldname] = filename;
                    }
                }
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const isEmployeeExists = yield employeeModel.getSingleEmployee(rest.employee_id, hotel_code);
                if (!isEmployeeExists) {
                    throw new customEror_1.default("Employee with the related id not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const isPayrollExistsForMonth = yield model.hasPayrollForMonth({
                    employee_id: isEmployeeExists.id,
                    hotel_code,
                    salary_date: rest.salary_date,
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
                let totalDays = rest.total_days;
                rest.daily_rate = Number(rest.basic_salary) / totalDays;
                rest.payable_days = totalDays - (rest.unpaid_leave_days || 0);
                rest.unpaid_leave_deduction =
                    rest.daily_rate * (rest.unpaid_leave_days || 0);
                rest.daily_rate = Number(rest.basic_salary) / rest.total_days;
                rest.payable_days =
                    rest.total_days -
                        ((rest.leave_days || 0) + (rest.unpaid_leave_days || 0));
                rest.unpaid_leave_deduction =
                    rest.daily_rate * (rest.unpaid_leave_days || 0);
                const totalDaysCheck = (rest.payable_days || 0) +
                    (rest.leave_days || 0) +
                    (rest.unpaid_leave_days || 0);
                if (totalDaysCheck !== rest.total_days) {
                    throw new customEror_1.default(`Total days mismatch!`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                // 4. Validate unpaid_leave_deduction
                const expectedUnpaidDeduction = rest.daily_rate * (rest.unpaid_leave_days || 0);
                if (Number((_a = rest.unpaid_leave_deduction) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !==
                    Number(expectedUnpaidDeduction.toFixed(2))) {
                    throw new customEror_1.default(`Unpaid leave deduction mismatch!`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                console.log({ deductions, allowances });
                const deduction_parse = deductions ? JSON.parse(deductions) : [];
                const allowances_parse = allowances ? JSON.parse(allowances) : [];
                console.log({ deduction_parse, allowances_parse });
                let totalDeductions = 0;
                let totalAllowances = 0;
                // 🔹 Handle Deductions
                let deductionsPayload = [];
                if (deduction_parse && deduction_parse.length) {
                    deductionsPayload = yield Promise.all(deduction_parse.map((deduction) => __awaiter(this, void 0, void 0, function* () {
                        const amount = Number(deduction.deduction_amount);
                        totalDeductions = totalDeductions + amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            deduction_name: deduction.deduction_name,
                            deduction_amount: amount,
                        };
                    })));
                }
                // 🔹 Handle Allowances
                let allowancesPayload = [];
                if (allowances_parse.length) {
                    allowancesPayload = yield Promise.all(allowances_parse.map((allowance) => __awaiter(this, void 0, void 0, function* () {
                        const amount = Number(allowance.allowance_amount);
                        totalAllowances = totalAllowances + amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            allowance_name: allowance.allowance_name,
                            allowance_amount: amount,
                        };
                    })));
                }
                const grossSalary = Number(rest.payable_days) * Number(rest.daily_rate) +
                    Number(totalAllowances) || 0;
                const netSalary = grossSalary - totalDeductions || 0;
                const payload = {
                    employee_id: rest.employee_id,
                    account_id,
                    basic_salary: rest.basic_salary,
                    total_allowance: totalAllowances,
                    total_deduction: totalDeductions,
                    net_salary: netSalary,
                    gross_salary: grossSalary,
                    unpaid_leave_deduction: expectedUnpaidDeduction || 0,
                    docs: rest.docs || null,
                    leave_days: rest.leave_days || 0,
                    unpaid_leave_days: rest.unpaid_leave_days || 0,
                    note: rest.note || null,
                    salary_basis: rest.salary_basis,
                    total_days: rest.total_days,
                    payable_days: rest.payable_days,
                    daily_rate: rest.daily_rate,
                    salary_date: rest.salary_date,
                    created_by: id,
                    hotel_code,
                };
                const res = yield model.CreatePayRoll(payload);
                const payroll_id = (_b = res[0]) === null || _b === void 0 ? void 0 : _b.id;
                console.log({ deductionsPayload });
                if (deductionsPayload.length) {
                    const deductionsWithPayrollId = deductionsPayload.map((d) => (Object.assign(Object.assign({}, d), { payroll_id })));
                    console.log({ deductionsWithPayrollId });
                    yield model.createEmployeeDeductions(deductionsWithPayrollId);
                }
                if (expectedUnpaidDeduction) {
                    yield model.createEmployeeDeductions([
                        {
                            employee_id: rest.employee_id,
                            deduction_amount: expectedUnpaidDeduction,
                            deduction_name: "Unpaid Leave Deduction",
                            payroll_id,
                        },
                    ]);
                }
                if (allowancesPayload.length) {
                    const allowancesWithPayrollId = allowancesPayload.map((a) => (Object.assign(Object.assign({}, a), { payroll_id })));
                    yield model.createEmployeeAllowances(allowancesWithPayrollId);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Payroll created successfully.",
                };
            }));
        });
    }
    // Get all Pay Roll
    getAllPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const model = this.Model.payRollModel();
            const { data, total } = yield model.getAllPayRoll({
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
    // get Single payRoll
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
                const _a = req.body, { add_deductions, delete_deductions, add_allowances, delete_allowances, account_id } = _a, rest = __rest(_a, ["add_deductions", "delete_deductions", "add_allowances", "delete_allowances", "account_id"]);
                const files = req.files || [];
                files.forEach(({ fieldname, filename }) => (rest[fieldname] = filename));
                const employeeModel = this.Model.employeeModel(trx);
                const model = this.Model.payRollModel(trx);
                const accountModel = this.Model.accountModel(trx);
                // Validate existing payroll
                const existingPayroll = yield model.getSinglePayRoll(parseInt(id), hotel_code);
                if (!existingPayroll) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Payroll not found",
                    };
                }
                // Validate employee
                const employee = yield employeeModel.getSingleEmployee(existingPayroll.employee_id, hotel_code);
                if (!employee) {
                    throw new customEror_1.default("Employee not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log(1);
                // Validate account
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
                // Calculate base rates
                rest.daily_rate = Number(rest.basic_salary) / rest.total_days;
                rest.payable_days =
                    Number(rest.total_days) -
                        (Number(rest.leave_days || 0) +
                            Number(rest.unpaid_leave_days || 0));
                const expectedUnpaidDeduction = rest.daily_rate * Number(rest.unpaid_leave_days || 0);
                rest.unpaid_leave_deduction = expectedUnpaidDeduction;
                // Validate total days
                if (Number(rest.total_days) !==
                    rest.payable_days +
                        Number(rest.leave_days || 0) +
                        Number(rest.unpaid_leave_days || 0)) {
                    throw new customEror_1.default("Total days mismatch!", this.StatusCode.HTTP_BAD_REQUEST);
                }
                console.log(2);
                // Parse additions/deletions
                const deductionsToAdd = add_deductions
                    ? JSON.parse(add_deductions)
                    : [];
                const deductionsToDelete = delete_deductions
                    ? JSON.parse(delete_deductions)
                    : [];
                const allowancesToAdd = add_allowances
                    ? JSON.parse(add_allowances)
                    : [];
                const allowancesToDelete = delete_allowances
                    ? JSON.parse(delete_allowances)
                    : [];
                let totalDeductions = 0;
                let totalAllowances = 0;
                console.log(3);
                // Delete specified deductions/allowances
                if (deductionsToDelete.length)
                    yield model.deleteEmployeeDeductionsNotIn({
                        payroll_id: parseInt(id),
                        ids: deductionsToDelete,
                    });
                if (allowancesToDelete.length)
                    yield model.deleteEmployeeAllowancesNotIn({
                        payroll_id: parseInt(id),
                        ids: allowancesToDelete,
                    });
                console.log(4);
                // Handle deductions
                const existingDeductions = yield model.getEmployeeDeductionsByPayrollId(parseInt(id));
                const existingDedMap = new Map(existingDeductions.map((d) => [d.id, d]));
                console.log(5);
                for (const d of deductionsToAdd) {
                    const amount = Number(d.deduction_amount || 0);
                    totalDeductions += amount;
                    console.log(6);
                    if (d.id && existingDedMap.has(d.id)) {
                        console.log(7);
                        yield model.updateEmployeeDeductions({
                            id: d.id,
                            payload: {
                                deduction_name: d.deduction_name,
                                amount,
                                employee_id: employee.id,
                                is_deleted: d.is_deleted,
                            },
                        });
                    }
                    else if (!d.is_deleted) {
                        console.log(8);
                        yield model.createEmployeeDeductions([
                            {
                                payroll_id: parseInt(id),
                                employee_id: employee.id,
                                deduction_name: d.deduction_name,
                                deduction_amount: amount,
                            },
                        ]);
                    }
                }
                console.log(9);
                // Handle allowances
                const existingAllowances = yield model.getEmployeeAllowancesByPayrollId(parseInt(id));
                const existingAllowMap = new Map(existingAllowances.map((a) => [a.id, a]));
                console.log(10);
                for (const a of allowancesToAdd) {
                    const amount = Number(a.allowance_amount || 0);
                    totalAllowances += amount;
                    console.log(11);
                    if (a.id && existingAllowMap.has(a.id)) {
                        yield model.updateEmployeeAllowances({
                            id: a.id,
                            payload: {
                                employee_id: employee.id,
                                allowance_id: a.allowance_id,
                                allowance_amount: amount,
                                is_deleted: a.is_deleted,
                            },
                        });
                    }
                    else if (!a.is_deleted) {
                        console.log(12);
                        yield model.createEmployeeAllowances([
                            {
                                payroll_id: parseInt(id),
                                employee_id: employee.id,
                                allowance_name: a.allowance_name,
                                allowance_amount: amount,
                            },
                        ]);
                        console.log(13);
                    }
                }
                console.log(14);
                // Recalculate salaries
                const grossSalary = rest.payable_days * rest.daily_rate + totalAllowances;
                const netSalary = grossSalary - totalDeductions;
                const payload = Object.assign(Object.assign({}, rest), { account_id, total_allowance: totalAllowances, total_deduction: totalDeductions, gross_salary: grossSalary, net_salary: netSalary, updated_by: admin_id, hotel_code });
                yield model.updatePayRoll({ id: parseInt(id), payload });
                // Ensure unpaid leave deduction exists
                if (expectedUnpaidDeduction) {
                    yield model.createEmployeeDeductions([
                        {
                            employee_id: employee.id,
                            deduction_amount: expectedUnpaidDeduction,
                            deduction_name: "Unpaid Leave Deduction",
                            payroll_id: Number(id),
                        },
                    ]);
                }
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
                yield model.updatePayRoll({
                    id: parseInt(id),
                    payload: {
                        is_deleted: true,
                        deleted_by: admin_id,
                        deleted_at: new Date(),
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