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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class EmployeeAllowancesService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createEmployeeAllowance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { employee_id, allowanceIds } = req.body;
                const { hotel_code } = req.hotel_admin;
                const hrModel = this.Model.hrModel(trx);
                const employeeModel = this.Model.employeeModel();
                const employee = yield employeeModel.getSingleEmployee(employee_id, hotel_code);
                if (!employee) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Employee not found",
                    };
                }
                console.log({ salary: employee.salary });
                // return;
                const allowanceDetails = yield hrModel.getAllowancesByIds(allowanceIds, hotel_code);
                const employeeAllowanceData = allowanceIds.map((a) => {
                    const allowance = allowanceDetails.find((ad) => ad.id === a);
                    if (!allowance)
                        throw new Error(`Allowance ID ${a} not found`);
                    let amount = allowance.value;
                    if (allowance.type === "percentage") {
                        amount = Math.round((Number(employee.salary) * Number(allowance.value)) /
                            100).toString();
                    }
                    return {
                        employee_id,
                        allowance_id: a,
                        amount,
                    };
                });
                yield Promise.all(employeeAllowanceData.map((data) => hrModel.createEmployeeAllowance(data)));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Employee Allowances have been created",
                };
            }));
        });
    }
}
exports.default = EmployeeAllowancesService;
//# sourceMappingURL=employeeAllowances.service.js.map