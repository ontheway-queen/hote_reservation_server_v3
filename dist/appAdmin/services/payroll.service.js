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
                var _a;
                const { hotel_code } = req.hotel_admin;
                const _b = req.body, { deductions, allowances, service_charge } = _b, rest = __rest(_b, ["deductions", "allowances", "service_charge"]);
                const files = req.files || [];
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
                    id: rest.ac_tr_ac_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const last_balance = checkAccount[0].last_balance;
                if (last_balance < rest.total_salary) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Insufficient balance in this account for pay",
                    };
                }
                const deduction_parse = deductions ? JSON.parse(deductions) : [];
                const allowances_parse = allowances ? JSON.parse(allowances) : [];
                let totalDeductions = 0;
                let totalAllowances = 0;
                // 🔹 Handle Deductions
                let deductionsPayload = [];
                if (deduction_parse.length) {
                    deductionsPayload = yield Promise.all(deduction_parse.map((deduction) => __awaiter(this, void 0, void 0, function* () {
                        const isDeductionExists = yield this.Model.hrModel(trx).getSingleDeduction({
                            id: deduction.deduction_id,
                            hotel_code,
                        });
                        if (!isDeductionExists) {
                            throw new customEror_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        let amount;
                        if (deduction.amount != null) {
                            amount = Number(deduction.amount);
                        }
                        else {
                            if (isDeductionExists.type === "fixed") {
                                amount = Number(isDeductionExists.value);
                            }
                            else if (isDeductionExists.type === "percentage") {
                                amount =
                                    (Number(isEmployeeExists.salary) *
                                        Number(isDeductionExists.value)) /
                                        100;
                            }
                            else {
                                throw new customEror_1.default(`Unknown deduction type for id ${isDeductionExists.id}: ${isDeductionExists.type}`, this.StatusCode.HTTP_BAD_REQUEST);
                            }
                        }
                        totalDeductions += amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            deduction_id: deduction.deduction_id,
                            amount,
                        };
                    })));
                }
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
                        let amount;
                        if (allowance.amount != null) {
                            amount = Number(allowance.amount);
                        }
                        else {
                            if (isAllowanceExists.type === "fixed") {
                                amount = Number(isAllowanceExists.value);
                            }
                            else if (isAllowanceExists.type === "percentage") {
                                amount =
                                    (Number(isEmployeeExists.salary) *
                                        Number(isAllowanceExists.value)) /
                                        100;
                            }
                            else {
                                throw new customEror_1.default(`Unknown allowance type for id ${isAllowanceExists.id}: ${isAllowanceExists.type}`, this.StatusCode.HTTP_NOT_FOUND);
                            }
                        }
                        totalAllowances += amount;
                        return {
                            employee_id: isEmployeeExists.id,
                            allowance_id: allowance.allowance_id,
                            amount,
                        };
                    })));
                }
                let serviceChargeValue = 0;
                if (service_charge != null) {
                    serviceChargeValue =
                        (Number(isEmployeeExists.salary) * Number(service_charge)) /
                            100;
                }
                const grossSalary = Number(isEmployeeExists.salary) + totalAllowances;
                const netSalary = grossSalary - totalDeductions - serviceChargeValue;
                const payload = {
                    employee_id: rest.employee_id,
                    month: rest.salary_date,
                    basic_salary: Number(isEmployeeExists.salary),
                    total_allowance: totalAllowances,
                    total_overtime: 0,
                    service_charge: serviceChargeValue,
                    total_deduction: totalDeductions,
                    net_salary: netSalary,
                    hotel_code,
                };
                const res = yield model.CreatePayRoll(payload);
                const payroll_id = (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id;
                if (deductionsPayload.length) {
                    const deductionsWithPayrollId = deductionsPayload.map((d) => (Object.assign(Object.assign({}, d), { payroll_id })));
                    yield model.createEmployeeDeductions(deductionsWithPayrollId);
                }
                if (allowancesPayload.length) {
                    const allowancesWithPayrollId = allowancesPayload.map((a) => (Object.assign(Object.assign({}, a), { payroll_id })));
                    yield model.createEmployeeAllowances(allowancesWithPayrollId);
                }
                const service_charge_payload = {
                    month: rest.salary_date,
                    employee_id: rest.employee_id,
                    percentage: service_charge,
                    amount: serviceChargeValue,
                    hotel_code,
                    payroll_id,
                };
                yield model.createServiceChargeDistribution(service_charge_payload);
                if (files.length) {
                    const payslipPayload = {
                        payroll_id,
                        file_url: files[0].filename,
                    };
                    yield model.insertPaySlip(payslipPayload);
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