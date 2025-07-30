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
exports.HelperFunction = void 0;
const moment_1 = __importDefault(require("moment"));
const abstract_service_1 = __importDefault(require("../../../abstarcts/abstract.service"));
class HelperFunction extends abstract_service_1.default {
    static generateRateCalendar(rawData) {
        const calendarOutput = [];
        for (const detail of rawData.rate_plan_details) {
            const room_type_id = detail.room_type_id;
            // Filter overrides
            const overrideMap = new Map();
            for (const d of rawData.daily_rates) {
                if (d.room_type_id === room_type_id) {
                    overrideMap.set(d.date, d);
                }
            }
            const start = new Date(detail.start_date);
            const end = new Date(detail.end_date);
            const dailyRates = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split("T")[0];
                const override = overrideMap.get(dateStr);
                if (override) {
                    dailyRates.push({
                        date: dateStr,
                        day_name: d.toLocaleDateString("en-US", { weekday: "long" }),
                        rate: override.rate,
                        extra_adult_rate: override.extra_adult_rate,
                        extra_child_rate: override.extra_child_rate,
                        stop_sell: override.stop_sell,
                        is_override: true,
                    });
                }
                else {
                    dailyRates.push({
                        date: dateStr,
                        day_name: d.toLocaleDateString("en-US", { weekday: "long" }),
                        rate: detail.base_rate,
                        extra_adult_rate: detail.extra_adult_rate,
                        extra_child_rate: detail.extra_child_rate,
                        stop_sell: false,
                        is_override: false,
                    });
                }
            }
            calendarOutput.push({
                room_type_id: detail.room_type_id,
                room_type_name: detail.room_type_name,
                base_rate: detail.base_rate,
                extra_adult_rate: detail.extra_adult_rate,
                extra_child_rate: detail.extra_child_rate,
                rates: dailyRates,
            });
        }
        return calendarOutput;
    }
    static getDatesBetween(startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);
        const stop = new Date(endDate);
        while (current <= stop) {
            dates.push(current.toISOString().slice(0, 10)); // YYYY-MM-DD format
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    static calculateNights(checkIn, checkOut) {
        const from = new Date(checkIn);
        const to = new Date(checkOut);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    static generateFolioNumber(lastFolioId) {
        const now = (0, moment_1.default)();
        const prefix = `FOLIO-${now.format("YYYYMM")}`;
        const nextId = (lastFolioId || 0) + 1;
        const padded = nextId.toString().padStart(4, "0");
        return `${prefix}-${padded}`;
    }
    generateVoucherNo(type, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, moment_1.default)();
            const prefix = `${type}-${now.format("YYYY")}`;
            const model = this.Model.DboModel(trx);
            const getLasVoucherId = yield model.getLastNo("Voucher");
            let next = 1;
            if (getLasVoucherId === undefined) {
                yield model.insertLastNo({ type: "Voucher", last_no: next });
            }
            else {
                next = getLasVoucherId.last_no + 1;
                yield model.updateLastNo("Voucher", next);
            }
            if (getLasVoucherId === undefined) {
                yield model.insertLastNo({ type: "Voucher", last_no: next });
            }
            else {
                next = getLasVoucherId.last_no + 1;
                yield model.updateLastNo("Voucher", next);
            }
            const padded = next.toString().padStart(4, "0");
            return `${prefix}-${padded}`;
        });
    }
    generateMoneyReceiptNo(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, moment_1.default)();
            const prefix = `MR-${now.format("YYYY")}`;
            const model = this.Model.DboModel(trx);
            const getLastReceiptNo = yield model.getLastNo("MoneyReceipt");
            let next = 1;
            if (getLastReceiptNo === undefined) {
                yield model.insertLastNo({ type: "MoneyReceipt", last_no: next });
            }
            else {
                next = getLastReceiptNo.last_no + 1;
                yield model.updateLastNo("MoneyReceipt", next);
            }
            const padded = next.toString().padStart(4, "0");
            return `${prefix}-${padded}`;
        });
    }
    generateInvoiceNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastId = yield this.Model.hotelInvoiceModel().getLastInvoiceId();
            const nextId = lastId + 1;
            const padded = String(nextId).padStart(6, "0"); // e.g., "000004"
            return `INV-${padded}`;
        });
    }
}
exports.HelperFunction = HelperFunction;
//# sourceMappingURL=helperFunction.js.map