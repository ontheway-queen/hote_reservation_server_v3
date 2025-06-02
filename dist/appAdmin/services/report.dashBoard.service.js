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
class ReportService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getDashboardData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const data = yield this.db.raw(`CALL ${this.schema.RESERVATION_SCHEMA}.dashboard_data(?)`, [hotel_code]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0][0][0],
            };
        });
    }
    // Dashboard Acount Report
    getAccountReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, ac_type } = req.query;
            const { hotel_code } = req.hotel_admin;
            // model
            const model = this.Model.dashBoardModel();
            const { total, totalDebitAmount, totalCreditAmount } = yield model.getAccountReport({
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                ac_type: ac_type,
            });
            const totalRemainingAmount = totalCreditAmount - totalDebitAmount;
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                totalDebitAmount,
                totalCreditAmount,
                totalRemainingAmount,
            };
        });
    }
    // Dashboard room Report
    getRoomReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, ac_type } = req.query;
            const { hotel_code } = req.hotel_admin;
            // model
            const model = this.Model.dashBoardModel();
            const { total_room, total_super_deluxe_room, total_deluxe_room, total_double_room, total_single_room, } = yield model.getRoomReport({
                from_date: from_date,
                to_date: to_date,
                hotel_code,
            });
            const others_room = Number(total_room) -
                (Number(total_super_deluxe_room) +
                    Number(total_deluxe_room) +
                    Number(total_double_room) +
                    Number(total_single_room));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    total_room,
                    total_super_deluxe_room,
                    total_deluxe_room,
                    total_double_room,
                    total_single_room,
                    others_room,
                },
            };
        });
    }
}
exports.default = ReportService;
//# sourceMappingURL=report.dashBoard.service.js.map