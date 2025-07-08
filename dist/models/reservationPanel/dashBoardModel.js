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
                    this.andWhere("ac.acc_type", ac_type);
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
                    this.andWhere("ac.acc_type", ac_type);
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
                    this.andWhere("ac.acc_type", ac_type);
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
                    this.andWhere("ac.acc_type", ac_type);
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
                totalRooms: (roomCount === null || roomCount === void 0 ? void 0 : roomCount.total)
                    ? parseInt(roomCount.total)
                    : 0,
            };
        });
    }
    getHotelStatisticsArrivalDepartureStays({ current_date, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalArrivals = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.check_in", current_date)
                .andWhere("b.status", "confirmed")
                .first();
            const totalDepartures = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.status", "checked_in")
                .andWhere("b.check_out", current_date)
                .first();
            const totalStays = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
            })
                .andWhere("b.status", "checked_in")
                .first();
            return {
                totalStays: totalStays ? Number(totalStays.total) : 0,
                totalDepartures: totalDepartures
                    ? Number(totalDepartures.total)
                    : 0,
                totalArrivals: totalArrivals ? Number(totalArrivals.total) : 0,
            };
        });
    }
    getOccupiedRoomAndBookings({ hotel_code, current_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalOccupiedRoomsResult = yield this.db("booking_rooms as br")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("br.id as totalrooms")
                .join("bookings as b", "br.booking_id", "b.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
            })
                .andWhere(function () {
                this.where(function () {
                    this.where("b.booking_type", "B").andWhere("b.status", "confirmed");
                })
                    .orWhere(function () {
                    this.where("b.booking_type", "B").andWhere("b.status", "checked_in");
                })
                    .orWhere(function () {
                    this.where("b.booking_type", "H").andWhere("b.status", "confirmed");
                });
            })
                .first();
            const totalActiveBookings = yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .where(function () {
                this.where(function () {
                    this.where("booking_type", "B").andWhere("status", "confirmed");
                }).orWhere(function () {
                    this.where("booking_type", "B").andWhere("status", "checked_in");
                });
            })
                .first();
            const totalHoldBookings = yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .where(function () {
                this.where("booking_type", "H").andWhere("status", "confirmed");
            })
                .first();
            return {
                totalOccupiedRoomsResult: totalOccupiedRoomsResult
                    ? Number(totalOccupiedRoomsResult.totalrooms)
                    : 0,
                totalActiveBookings: totalActiveBookings
                    ? Number(totalActiveBookings.total)
                    : 0,
                totalHoldBookings: totalHoldBookings
                    ? Number(totalHoldBookings.total)
                    : 0,
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