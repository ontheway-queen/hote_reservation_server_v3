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
                console.log({ account_id });
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
                // const last_balance = checkAccount[0].last_balance;
                // if (last_balance < rest.total_salary) {
                // 	return {
                // 		success: false,
                // 		code: this.StatusCode.HTTP_BAD_REQUEST,
                // 		message: "Insufficient balance in this account for pay",
                // 	};
                // }
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
                const deduction_parse = deductions ? JSON.parse(deductions) : [];
                const allowances_parse = allowances ? JSON.parse(allowances) : [];
                let totalDeductions = 0;
                let totalAllowances = 0;
                // 🔹 Handle Deductions
                let deductionsPayload = [];
                if (deduction_parse.length) {
                    deductionsPayload = yield Promise.all(deduction_parse.map((deduction) => __awaiter(this, void 0, void 0, function* () {
                        // const isDeductionExists = await this.Model.hrModel(
                        // 	trx
                        // ).getSingleDeduction({
                        // 	id: deduction.deduction_id,
                        // 	hotel_code,
                        // });
                        // if (!isDeductionExists) {
                        // 	throw new CustomError(
                        // 		this.ResMsg.HTTP_NOT_FOUND,
                        // 		this.StatusCode.HTTP_NOT_FOUND
                        // 	);
                        // }
                        const amount = Number(deduction.amount);
                        totalDeductions = totalDeductions + amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            deduction_name: deduction.deduction_name,
                            amount,
                        };
                    })));
                }
                console.log({ totalDeductions });
                // 🔹 Handle Allowances
                let allowancesPayload = [];
                if (allowances_parse.length) {
                    allowancesPayload = yield Promise.all(allowances_parse.map((allowance) => __awaiter(this, void 0, void 0, function* () {
                        const isAllowanceExists = yield this.Model.hrModel(trx).getSingleAllowance({
                            id: allowance.allowance_id,
                            hotel_code,
                        });
                        if (!isAllowanceExists) {
                            throw new customEror_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        const amount = Number(allowance.amount);
                        totalAllowances = totalAllowances + amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            allowance_id: allowance.allowance_id,
                            amount,
                        };
                    })));
                }
                const grossSalary = Number(rest.payable_days * rest.daily_rate) + totalAllowances;
                console.log({ grossSalary });
                const netSalary = grossSalary - totalDeductions;
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
                console.log({ payload });
                const res = yield model.CreatePayRoll(payload);
                const payroll_id = (_b = res[0]) === null || _b === void 0 ? void 0 : _b.id;
                if (deductionsPayload.length) {
                    const deductionsWithPayrollId = deductionsPayload.map((d) => (Object.assign(Object.assign({}, d), { payroll_id })));
                    yield model.createEmployeeDeductions(deductionsWithPayrollId);
                }
                if (expectedUnpaidDeduction) {
                    yield model.createEmployeeDeductions([
                        {
                            employee_id: rest.employee_id,
                            amount: expectedUnpaidDeduction,
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
}
exports.default = PayRollService;
//# sourceMappingURL=payroll.service.js.map