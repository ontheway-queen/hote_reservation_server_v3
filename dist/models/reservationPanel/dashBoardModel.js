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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class DashBoardModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAllInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, from_date, to_date } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("inv_view as iv");
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("iv.invoice_id", "iv.due")
                .where("iv.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("iv.created_at", [from_date, endDate]);
                }
            })
                .orderBy("iv.invoice_id", "desc");
            const total = yield this.db("inv_view as iv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("invoice_id as total")
                .where("iv.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("iv.created_at", [from_date, endDate]);
                }
            });
            const totalAmount = yield this.db("inv_view as iv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("invoice_id as total")
                .sum("iv.due as totalAmount")
                .where({ hotel_code })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("iv.created_at", [from_date, endDate]);
                }
            });
            return {
                data,
                totalAmount: totalAmount[0].totalAmount,
                total: total[0].total,
            };
        });
    }
    getRoomBookingReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, hotel_code } = payload;
            // exact end date
            const endDatePlusOneDay = new Date(to_date);
            endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);
            // for ending room booking
            const total_pending_room_booking = yield this.db("room_booking_view as rbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rbv.id as total_pending_room")
                .where({ hotel_code, status: "pending" })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            // for ending room booking
            const total_rejected_room_booking = yield this.db("room_booking_view as rbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rbv.id as total_rejected_room")
                .where({ hotel_code, status: "rejected" })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            // for count total
            const total_approved_room_booking = yield this.db("room_booking_view as rbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rbv.id as total_approved_room")
                .where({ hotel_code, status: "approved" })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            const totalBookingAmount = yield this.db("room_booking_view as rbv")
                .count("rbv.id as total")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("rbv.grand_total as totalAmount")
                .where({ hotel_code, status: "approved", pay_status: 1 })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("rbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            return {
                totalBookingAmount: totalBookingAmount[0].totalAmount,
                total_approved_room_booking: total_approved_room_booking[0].total_approved_room,
                total_rejected_room_booking: total_rejected_room_booking[0].total_rejected_room,
                total_pending_room_booking: total_pending_room_booking[0].total_pending_room,
            };
        });
    }
    getHallBookingReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, from_date, to_date, user_id } = payload;
            const dtbs = this.db("hall_booking_view as hbv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const endDatePlusOneDay = new Date(to_date);
            endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);
            const data = yield dtbs.withSchema(this.RESERVATION_SCHEMA);
            const total_confimed_hall = yield this.db("hall_booking_view as hbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hbv.id as total_confimed")
                .where("hbv.hotel_code", hotel_code)
                .andWhere({ booking_status: "confirmed" })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            const total_pending_hall = yield this.db("hall_booking_view as hbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hbv.id as total_pending")
                .where("hbv.hotel_code", hotel_code)
                .andWhere({ booking_status: "pending" })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            const total_canceled_hall = yield this.db("hall_booking_view as hbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hbv.id as total_canceled")
                .where("hbv.hotel_code", hotel_code)
                .andWhere({ booking_status: "canceled" })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            const totalAmount = yield this.db("hall_booking_view as hbv")
                .count("hbv.id as total")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("hbv.grand_total as totalAmount")
                .where("hbv.hotel_code", hotel_code)
                .andWhere({ booking_status: "confirmed", pay_status: 1 })
                .andWhere(function () {
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.created_at", [
                        from_date,
                        endDatePlusOneDay,
                    ]);
                }
            });
            return {
                data,
                totalAmount: totalAmount[0].totalAmount,
                total_confimed_hall: total_confimed_hall[0].total_confimed,
                total_pending_hall: total_pending_hall[0].total_pending,
                total_canceled_hall: total_canceled_hall[0].total_canceled,
            };
        });
    }
    getAccountReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ac_type, from_date, hotel_code, to_date } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const total = yield this.db("acc_ledger AS al")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("al.ledger_id as total")
                .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("al.created_at", [from_date, endDate]);
                }
                this.andWhere("al.hotel_code", hotel_code);
                if (ac_type) {
                    this.andWhere("ac.ac_type", ac_type);
                }
            });
            // total debit amount
            const totalDebitAmount = yield this.db("acc_ledger AS al")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("al.ledger_debit_amount as totalDebit")
                .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("al.created_at", [from_date, endDate]);
                }
                this.andWhere("al.hotel_code", hotel_code);
                if (ac_type) {
                    this.andWhere("ac.ac_type", ac_type);
                }
            });
            // total credit amount
            const totalCreditAmount = yield this.db("acc_ledger AS al")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("al.ledger_credit_amount as totalCredit")
                .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("al.created_at", [from_date, endDate]);
                }
                this.andWhere("al.hotel_code", hotel_code);
                if (ac_type) {
                    this.andWhere("ac.ac_type", ac_type);
                }
            });
            // total total Remainig balance
            const totalRemaining = yield this.db("acc_ledger AS al")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("al.ledger_balance as totalRemaining")
                .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
                .where(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("al.created_at", [from_date, endDate]);
                }
                this.andWhere("al.hotel_code", hotel_code);
                if (ac_type) {
                    this.andWhere("ac.ac_type", ac_type);
                }
            });
            return {
                total: total[0].total,
                totalDebitAmount: totalDebitAmount[0].totalDebit | 0,
                totalCreditAmount: totalCreditAmount[0].totalCredit | 0,
                totalRemainingAmount: totalRemaining[0].totalRemaining | 0,
            };
        });
    }
    getHotelStatistics(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomCount = yield this.db("rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where({ hotel_code })
                .first();
            return {
                total_room: (roomCount === null || roomCount === void 0 ? void 0 : roomCount.total) ? roomCount.total : 0,
            };
        });
    }
    getGuestReport({ current_date, hotel_code, booking_mode, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (booking_mode == "arrival") {
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("g.id as guest_id", "g.first_name", "g.last_name", "b.check_in", "b.check_out", "b.status")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_in", current_date)
                    .andWhere("b.status", "confirmed")
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0);
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_in", current_date)
                    .andWhere("b.status", "confirmed")
                    .first();
                return {
                    data,
                    total: total ? total.total : 0,
                };
            }
            else if (booking_mode == "departure") {
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("g.id as guest_id", "g.first_name", "g.last_name", "b.check_in", "b.check_out", "b.status")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_out", current_date)
                    .andWhere("b.status", "checked_in")
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0);
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.status", "checked_in")
                    .andWhere("b.check_out", current_date)
                    .first();
                return {
                    data,
                    total: total ? total.total : 0,
                };
            }
            else {
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("g.id as guest_id", "g.first_name", "g.last_name", "b.check_in", "b.check_out", "b.status")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere(function () {
                    this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
                })
                    .andWhere("b.status", "checked_in")
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0);
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere(function () {
                    this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
                })
                    .andWhere("b.status", "checked_in")
                    .first();
                return {
                    data,
                    total: total ? total.total : 0,
                };
            }
        });
    }
    getRoomReport({ current_date, hotel_code, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ hotel_code });
            return yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id as room_type_id", "rt.name", this.db.raw(`
        COALESCE((
          SELECT json_build_object(
            'total_rooms', ra.total_rooms,
            'booked_rooms', ra.booked_rooms,
            'hold_rooms', ra.hold_rooms,
            'available_rooms', ra.available_rooms,
            'stop_sell', ra.stop_sell
          )
          FROM hotel_reservation.room_availability as ra
          WHERE rt.id = ra.room_type_id AND ra.date = ?
        ), json_build_object(
          'total_rooms', 0,
          'booked_rooms', 0,
          'hold_rooms', 0,
          'available_rooms', 0,
          'stop_sell', false
        )) as availability
        `, [current_date]))
                .where("rt.hotel_code", hotel_code);
        });
    }
    getGuestDistributionCountryWise({ hotel_code, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("guests")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("country", this.db.raw("count(id) as total_guests"))
                .where("hotel_code", hotel_code)
                .groupBy("country");
        });
    }
}
exports.default = DashBoardModel;
//# sourceMappingURL=dashBoardModel.js.map