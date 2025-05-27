"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ReportValidator {
    constructor() {
        // Room Report Validator
        this.getAllHotelRoomQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
        // Room Booking Report Validator
        this.getAllHotelRoomBookingQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            room_id: joi_1.default.string().allow("").optional(),
            check_in_out_status: joi_1.default.string().allow("").optional(),
            pay_status: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
        // Account Report Validator
        this.getAllAccountQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
        });
        // Expense Report Validator
        this.getAllExpenseQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
        });
        // get Salary Report query validator
        this.getSalaryReportQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
        // Hall Booking Report Validator
        this.getHallBookingQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            check_in_out_status: joi_1.default.string().allow("").optional(),
            pay_status: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            booking_status: joi_1.default.string().allow("").optional(),
        });
        // client ledger Report Validator
        this.getClientLedgerQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            pay_type: joi_1.default.string().allow("").optional(),
            user_id: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = ReportValidator;
//# sourceMappingURL=reports.validator.js.map