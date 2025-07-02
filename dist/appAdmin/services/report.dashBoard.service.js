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
    getHotelStatistics(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { totalRooms } = yield this.Model.dashBoardModel().getHotelStatistics(req.hotel_admin.hotel_code);
            const { totalArrivals, totalDepartures, totalStays } = yield this.Model.dashBoardModel().getHotelStatisticsArrivalDepartureStays({
                hotel_code: req.hotel_admin.hotel_code,
                current_date: req.query.current_date,
            });
            const { totalActiveBookings, totalHoldBookings, totalOccupiedRoomsResult } = yield this.Model.dashBoardModel().getOccupiedRoomAndBookings({
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    totalRooms,
                    totalArrivals,
                    totalDepartures,
                    totalStays,
                    totalActiveBookings,
                    totalHoldBookings,
                    totalOccupiedRoomsResult,
                },
            };
        });
    }
    getGuestReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this.Model.dashBoardModel().getGuestReport({
                hotel_code: req.hotel_admin.hotel_code,
                booking_mode: req.query.booking_mode,
                current_date: req.query.current_date,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    guest_data: data,
                    total,
                },
            };
        });
    }
    inhouseGuestListReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total, total_cbf, total_person, total_adult, total_children, total_infant, } = yield this.Model.reportModel().inhouseGuestListReport({
                search: req.query.search,
                hotel_code: req.hotel_admin.hotel_code,
                current_date: req.query.current_date,
                limit: req.query.limit,
                skip: req.query.skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                total_cbf,
                total_adult,
                total_children,
                total_infant,
                total_person,
                data,
            };
        });
    }
    getSingleGuestLedger(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, limit, skip } = req.query;
            const { data, total } = yield this.Model.guestModel().getSingleGuestLedeger({
                hotel_code: req.hotel_admin.hotel_code,
                from_date: from_date,
                to_date: to_date,
                guest_id: parseInt(req.params.id),
                limit: parseInt(limit),
                skip: parseInt(skip),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getGuestDistributionCountryWise(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.dashBoardModel().getGuestDistributionCountryWise({
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getRoomReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.dashBoardModel().getRoomReport({
                hotel_code: req.hotel_admin.hotel_code,
                current_date: req.query.current_date,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
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
}
exports.default = ReportService;
//# sourceMappingURL=report.dashBoard.service.js.map