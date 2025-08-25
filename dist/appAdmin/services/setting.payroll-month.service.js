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
class PayrollMonthsSettingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Payroll Months service ======================//
    // create Payroll Months
    createPayrollMonths(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { name, days, hours, month_id } = req.body;
                const model = this.Model.hrModel(trx);
                const { data } = yield model.getPayrollMonths({
                    month_id,
                    hotel_code,
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Month name already exists, give another unique Month name",
                    };
                }
                // model
                const res = yield model.createPayrollMonths({
                    hotel_code,
                    month_id,
                    days,
                    hours: Math.round(hours),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Payroll Months created successfully.",
                };
            }));
        });
    }
    // Get all Payroll Months
    getAllPayrollMonths(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name } = req.query;
            const model = this.Model.hrModel();
            const { data, total } = yield model.getPayrollMonths({
                limit: limit,
                skip: skip,
                name: name,
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
    // Update Payroll Months
    updatePayrollMonths(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.hrModel(trx);
                const res = yield model.updatePayrollMonths(parseInt(id), {
                    month_id: updatePayload.month_id,
                    days: updatePayload.days,
                    hours: updatePayload.hours,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Month name updated successfully",
                };
            }));
        });
    }
    // Delete Payroll Months
    deletePayrollMonths(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.hrModel(trx);
                const res = yield model.deletePayrollMonths(parseInt(id));
                if (res === 1) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Payroll Month deleted successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Payroll Month didn't find from this ID",
                    };
                }
            }));
        });
    }
}
exports.default = PayrollMonthsSettingService;
//# sourceMappingURL=setting.payroll-month.service.js.map