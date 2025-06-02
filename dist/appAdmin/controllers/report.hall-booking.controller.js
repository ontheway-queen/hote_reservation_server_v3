"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const reports_validator_1 = __importDefault(require("../utlis/validator/reports.validator"));
const report_hall_booking_service_1 = __importDefault(require("../services/report.hall_booking.service"));
class HallBookingReportController extends abstract_controller_1.default {
    constructor() {
        super();
        this.hallBookingReportService = new report_hall_booking_service_1.default();
        this.reportValidator = new reports_validator_1.default();
    }
}
exports.default = HallBookingReportController;
//# sourceMappingURL=report.hall-booking.controller.js.map