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
class HallBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert hall booking
    insertHallBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert booking hall
    insertBookingHall(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_halls")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllHallBookingByHallId(hotel_code, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.raw(`
            SELECT id as booking_id,booking_no,user_id,name,photo,status,grand_total FROM hotel_reservation.hall_booking_view 
            WHERE JSON_CONTAINS(booking_halls, '{"hall_id": ${name}}')
            AND hotel_code = ${hotel_code} AND status NOT IN ('left', 'rejected')
        `);
        });
    }
    // get last hall booking id
    getLastHallBookingId(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .where({ hotel_code })
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // get all hall booking
    getAllHallBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, booking_status, event_date, from_date, to_date, user_id, } = payload;
            const dtbs = this.db("hall_booking_view as hbv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate());
            const last24Hours = new Date();
            last24Hours.setDate(last24Hours.getDate() - 1);
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hbv.id", "hbv.booking_no", "hbv.user_id", "hbv.name as client_name", "hbv.email as client_mail", "hbv.phone as phone", "hbcio.id as hall_check_in", "hbv.event_date", "hbv.start_time", "hbv.end_time", "hbv.number_of_hours", "hbv.total_occupancy", "hbv.extra_charge", "hbv.grand_total", "hbv.no_payment", "hbv.partial_payment", "hbv.full_payment", "hbv.pay_status", "hbv.due", "hbv.reserved_hall", "hbv.booking_status", "hbv.booking_date", "hbv.hall_booking_inv_id", "hbv.created_by_id", "hbv.created_by_name", "hbv.check_in_out_status")
                .where("hotel_code", hotel_code)
                .leftJoin("hall_booking_check_in_out as hbcio", "hbv.id", "hbcio.booking_id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("hbv.name", "like", `%${key}%`)
                        .orWhere("hbv.email", "like", `%${key}%`)
                        .orWhere("hbv.phone", "like", `%${key}%`)
                        .orWhereRaw("JSON_EXTRACT(booking_halls, '$[*].name') LIKE ?", [
                        `%${key}%`,
                    ]);
                }
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (booking_status) {
                    this.andWhere({ booking_status });
                }
                if (event_date) {
                    this.andWhere("hbv.event_date", event_date);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.start_time", [from_date, endDate]);
                }
                this.where(function () {
                    this.where("hbv.check_in_out_status", "checked-in")
                        .orWhere("hbv.check_in_out_status", "checked-out")
                        .orWhereNull("hbv.check_in_out_status");
                }).andWhere(function () {
                    this.where("hbv.event_date", ">=", last24Hours.toISOString())
                        .orWhere("hbv.check_in_out_status", "checked-in")
                        .orWhereNull("hbv.check_in_out_status");
                });
            })
                .orderBy("hbv.id", "desc");
            const total = yield this.db("hall_booking_view as hbv")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("hall_booking_check_in_out as hbcio", "hbv.id", "hbcio.booking_id")
                .count("hbv.id as total")
                .where("hbv.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("hbv.name", "like", `%${key}%`)
                        .orWhere("hbv.email", "like", `%${key}%`)
                        .orWhere("hbv.phone", "like", `%${key}%`)
                        .orWhereRaw("JSON_EXTRACT(booking_halls, '$[*].name') LIKE ?", [
                        `%${key}%`,
                    ]);
                }
                if (user_id) {
                    this.andWhere({ user_id });
                }
                if (booking_status) {
                    this.andWhere({ booking_status });
                }
                if (event_date) {
                    this.andWhere("hbv.event_date", event_date);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbv.start_time", [from_date, endDate]);
                }
                this.where(function () {
                    this.where("hbv.check_in_out_status", "checked-in")
                        .orWhere("hbv.check_in_out_status", "checked-out")
                        .orWhereNull("hbv.check_in_out_status");
                }).andWhere(function () {
                    this.where("hbv.event_date", ">=", last24Hours.toISOString())
                        .orWhere("hbv.check_in_out_status", "checked-in")
                        .orWhereNull("hbv.check_in_out_status");
                });
            });
            return { data, total: total[0].total };
        });
    }
    // get single hall booking
    getSingleHallBooking(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ id })
                .andWhere({ hotel_code });
        });
    }
    // insert hall booking check in
    insertHallBookingCheckIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking_check_in_out")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all hall booking
    getAllHallBookingCheckIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, booking_id, from_date, to_date } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("hall_booking_check_in_out as hbco");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("hbco.id", "u.name as name", "u.email as email", "u.phone", "b.id as booking_id", "b.booking_no", "hbco.check_in", "hbco.check_out", "hbco.event_date", "hbco.status", "hbco.created_at")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("hall_booking as b", "hbco.booking_id", "b.id")
                .leftJoin("user as u", "b.user_id", "u.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("b.booking_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (booking_id) {
                    this.andWhere("b.id", booking_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbco.created_at", [from_date, endDate]);
                }
            })
                .orderBy("hbco.id", "desc");
            const total = yield this.db("hall_booking_check_in_out as hbco")
                .count("hbco.id as total")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("hall_booking as b", "hbco.booking_id", "b.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("b.booking_no", "like", `%${key}%`).orWhere("u.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (booking_id) {
                    this.andWhere("b.id", booking_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("hbco.created_at", [from_date, endDate]);
                }
            });
            return {
                data,
                total: total[0].total,
            };
        });
    }
    updateHallBooking(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id: where.id });
        });
    }
    // get single hall check in checkout
    getSingleHallBookingCheckIn(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_check_in_out_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere({ id });
        });
    }
    // add hall booking check out
    updateBookingCheckOut(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_booking_check_in_out")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Get All Guest Model
    getAllGuest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, limit, skip } = payload;
            const dtbs = this.db("user");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("id", "name", "email", "country", "city", "status", "last_balance", "created_at")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ hotel_code })
                .andWhere(function () {
                if (key) {
                    this.andWhere("name", "like", `%${key}%`)
                        .orWhere("email", "like", `%${key}%`)
                        .orWhere("country", "like", `%${key}%`)
                        .orWhere("city", "like", `%${key}%`);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("user")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where({ hotel_code })
                .andWhere(function () {
                if (key) {
                    this.andWhere("name", "like", `%${key}%`)
                        .orWhere("email", "like", `%${key}%`)
                        .orWhere("country", "like", `%${key}%`)
                        .orWhere("city", "like", `%${key}%`);
                }
            });
            return { data, total: total[0].total };
        });
    }
}
exports.default = HallBookingModel;
//# sourceMappingURL=hallBooking.Model.js.map