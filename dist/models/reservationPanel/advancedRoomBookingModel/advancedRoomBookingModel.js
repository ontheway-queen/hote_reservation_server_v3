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
const schema_1 = __importDefault(require("../../../utils/miscellaneous/schema"));
class AdvancedRoomBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert room booking
    insertRoomBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("advanced_room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert booking rooms
    insertBookingRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ad_booking_room_types")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all room booking
    getAllRoomBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, from_date, to_date, status, user_id, } = payload;
            const dtbs = this.db("ad_room_booking_view");
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
                .select("id", "booking_no", "user_id", "name", "photo", "email", "phone", "check_in_time", "check_out_time", "number_of_nights", "extra_charge", "grand_total", "no_payment", "partial_payment", "full_payment", "pay_status", "reserved_room", "created_by_id", "created_by_name", "status")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("name", "like", `%${name}%`)
                        .orWhere("email", "like", `%${name}%`)
                        .orWhere("phone", "like", `%${name}%`);
                    // .orWhereRaw(
                    //   "JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?",
                    //   [`%${name}%`]
                    // );
                }
                if (user_id) {
                    this.andWhere("user_id", user_id);
                }
                if (status) {
                    this.andWhere("status", status);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("check_in_time", [from_date, endDate]);
                }
            })
                .orderBy(".id", "desc");
            const total = yield this.db("ad_room_booking_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("name", "like", `%${name}%`)
                        .orWhere("email", "like", `%${name}%`)
                        .orWhere("phone", "like", `%${name}%`);
                    // .orWhereRaw(
                    //   "JSON_EXTRACT(booking_rooms, '$[*].room_number') LIKE ?",
                    //   [`%${name}%`]
                    // );
                }
                if (user_id) {
                    this.andWhere("user_id", user_id);
                }
                if (status) {
                    this.andWhere("status", status);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("check_in_time", [from_date, endDate]);
                }
            });
            return { data, total: total[0].total };
        });
    }
    // get single room booking
    getSingleRoomBooking(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ad_room_booking_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ id })
                .andWhere({ hotel_code });
        });
    }
    // get last room booking id
    getLastAdRoomBookingId(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("advanced_room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .where({ hotel_code })
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // update room booking
    updateRoomBooking(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = where;
            return yield this.db("advanced_room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // update room booking
    updateRoomBookingPayStatus(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload);
        });
    }
    // update booking room
    updateBookingRoom(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Get single room booking by invoice id
    updateRoomBookingByInvoiceId(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking_invoice_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .update("room_booking_inv_id", id)
                .andWhere({ hotel_code });
        });
    }
    // refund room booking
    refundRoomBooking(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id: where.id });
        });
    }
    // get all room booking by room id
    getAllRoomBookingByRoomId(hotel_code, room_number) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.raw(`
    SELECT id as booking_id,booking_no,user_id,name,photo,status,grand_total FROM hotel_reservation.room_booking_view 
    WHERE JSON_CONTAINS(booking_rooms, '{"room_id": ${room_number}}')
    AND hotel_code = ${hotel_code} AND status NOT IN ('left', 'rejected')
  `);
        });
    }
    // insert room booking check in
    insertRoomBookingCheckIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ad_booking_check_in_out")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Update room booking check in
    updateRoomBookingCheckIn(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("ad_booking_check_in_out")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // add room booking check out
    addRoomBookingCheckOut(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_check_in_out")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // get single check in checkout
    getSingleRoomBookingCheckIn(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("check_in_out_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere({ id });
        });
    }
    getRoomCheckInOutStatusByBookingID(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("check_in_out_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere("booking_id", id);
        });
    }
    // get all check in checkout
    getAllRoomBookingCheckIn(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, booking_id, from_date, to_date } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("booking_check_in_out as bco");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("bco.id", "u.name as guest_name", "b.id as booking_id", "b.check_out_time", "b.booking_no", "bco.check_in", "bco.check_out", "bco.status", "bco.created_at")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("room_booking as b", "bco.booking_id", "b.id")
                .leftJoin("user as u", "b.user_id", "u.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("b.booking_no", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (booking_id) {
                    this.andWhere("b.id", booking_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("bco.created_at", [from_date, endDate]);
                }
            })
                .orderBy("bco.id", "desc");
            const total = yield this.db("booking_check_in_out as bco")
                .count("bco.id as total")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("room_booking as b", "bco.booking_id", "b.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("b.booking_no", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (booking_id) {
                    this.andWhere("b.id", booking_id);
                }
                if (from_date && to_date) {
                    this.andWhereBetween("bco.created_at", [from_date, endDate]);
                }
            });
            return {
                data,
                total: total[0].total,
            };
        });
    }
}
exports.default = AdvancedRoomBookingModel;
//# sourceMappingURL=advancedRoomBookingModel.js.map