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
exports.ReservationModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ReservationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    calendar(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out } = payload;
            const db = this.db;
            return yield db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.hotel_code", db.raw(`
          COALESCE(
            json_agg(
              jsonb_build_object(
                'room_id', r.id,
                'room_name', r.room_name,
                'room_status',r.status,
                'bookings', COALESCE(
                  (
                    SELECT json_agg(
                      jsonb_build_object(
                      'booking_id',b.id,
                        'check_in', b.check_in,
                        'check_out', b.check_out,
                        'booking_status', b.status,
                        'guest_id',b.guest_id,
  
                        'guest_name', CONCAT(g.first_name, ' ', g.last_name),
                        'vat',b.vat,
                        'service_charge',b.service_charge,
                        'sub_total',b.sub_total,
                        'discount_amount',b.discount_amount,
                        'total_amount',b.total_amount
                      )
                    )
                    FROM ?? AS br2
                    JOIN ?? AS b ON br2.booking_id = b.id
                    JOIN ?? AS g ON b.guest_id = g.id
WHERE br2.room_id = r.id
AND (
  (b.booking_type = 'B' AND b.status NOT IN ('checked_out', 'pending', 'canceled', 'rejected'))
  OR
  (b.booking_type = 'H' AND b.status != 'canceled')
)


                      AND b.check_in <= ?
                      AND b.check_out >= ?
                      AND b.status != ?
                  ), '[]'
                )
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS rooms
          `, [
                `${this.RESERVATION_SCHEMA}.booking_rooms`,
                `${this.RESERVATION_SCHEMA}.bookings`,
                `${this.RESERVATION_SCHEMA}.guests`,
                check_out,
                check_in,
                "checkout",
            ]))
                .leftJoin("rooms as r", "rt.id", "r.room_type_id")
                .where("rt.hotel_code", hotel_code)
                .groupBy("rt.id");
        });
    }
    getAllAvailableRoomsTypeWithAvailableRoomCount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out, room_type_id } = payload;
            return yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.description", "rt.hotel_code", this.db.raw(`MIN(ra.available_rooms) AS available_rooms`), this.db.raw(`
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'rate_plan_id', rpd.id,
            'name', rp.name,
            'base_rate', rpd.base_rate
          )
        ) FILTER (WHERE rpd.id IS NOT NULL),
        '[]'
      ) AS rate_plans
    `))
                .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
                .leftJoin("rate_plan_details as rpd", "rt.id", "rpd.room_type_id")
                .leftJoin("rate_plans as rp", "rpd.rate_plan_id", "rp.id")
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
                .andWhere("ra.date", ">=", check_in)
                .andWhere("ra.date", "<", check_out)
                .andWhere(function () {
                if (room_type_id) {
                    this.andWhere("rt.id", room_type_id);
                }
            })
                .groupBy("rt.id")
                .having(this.db.raw("MIN(ra.available_rooms) > 0"));
        });
    }
    getAllAvailableRoomsByRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out, room_type_id } = payload;
            const schema = this.RESERVATION_SCHEMA;
            const availableRoomTypes = () => this.db(`${schema}.room_availability as ra`)
                .joinRaw(`
          JOIN (
            SELECT gs1.date AS gen_date
            FROM generate_series(?::date, (?::date - INTERVAL '1 day'), INTERVAL '1 day') AS gs1(date)
          ) d ON d.gen_date = ra.date
        `, [check_in, check_out])
                .where("ra.hotel_code", hotel_code)
                .andWhere("ra.room_type_id", room_type_id)
                .andWhere("ra.available_rooms", ">", 0)
                .groupBy("ra.room_type_id")
                .havingRaw(`
          COUNT(*) = (
            SELECT COUNT(*) FROM (
              SELECT gs2.date AS gen_date
              FROM generate_series(?::date, (?::date - INTERVAL '1 day'), INTERVAL '1 day') AS gs2(date)
            ) AS dd
          )
        `, [check_in, check_out])
                .select("ra.room_type_id");
            return yield this.db(`${schema}.rooms as r`)
                .select("r.hotel_code", "r.id as room_id", "r.room_name", "r.room_type_id", "rt.name as room_type_name")
                .leftJoin(`${schema}.room_types as rt`, "r.room_type_id", "rt.id")
                .where("r.hotel_code", hotel_code)
                .andWhere("r.is_deleted", false)
                .andWhere("r.room_type_id", room_type_id)
                .whereExists(availableRoomTypes())
                .whereNotExists(function () {
                this.select("*")
                    .from(`${schema}.bookings as b`)
                    .join(`${schema}.booking_rooms as br`, "br.booking_id", "b.id")
                    .whereRaw("br.room_id = r.id")
                    .andWhere(function () {
                    this.where(function () {
                        this.where("b.booking_type", "B").whereNotIn("br.status", [
                            "checked_out",
                            "pending",
                            "canceled",
                            "rejected",
                        ]);
                    }).orWhere(function () {
                        this.where("b.booking_type", "H").where("br.status", "!=", "canceled");
                    });
                })
                    .andWhere("br.check_in", "<", check_out)
                    .andWhere("br.check_out", ">", check_in);
            });
        });
    }
    getAllAvailableRoomsTypeForEachAvailableRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out } = payload;
            console.log({ check_in, check_out });
            const db = this.db;
            return yield db("room_availability as ra")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ra.room_type_id", "ra.hotel_code", "ra.available_rooms", db.raw("ra.date::text as date"))
                .where("ra.hotel_code", hotel_code)
                .andWhere("ra.date", ">=", check_in)
                .andWhere("ra.date", "<=", check_out)
                .orderBy("ra.date", "asc");
        });
    }
    insertBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllBookingRoomsByBookingId({ booking_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "room_id", "unit_base_rate", "unit_changed_rate", "base_rate", "changed_rate", "check_in", "check_out")
                .where({
                booking_id,
            });
        });
    }
    insertBookingRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getSingleBookingRoom({ booking_id, room_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "room_id", "unit_base_rate", "unit_changed_rate", "base_rate", "changed_rate", "check_in", "check_out")
                .where({
                booking_id,
                room_id,
            })
                .first();
        });
    }
    updateSingleBookingRoom(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("room_id", where.room_id)
                .andWhere("booking_id", where.booking_id);
        });
    }
    updateAllBookingRoomsByBookingID(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("booking_id", where.booking_id);
        });
    }
    insertBookingRoomGuest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_room_guest")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllBooking({ hotel_code, checkin_from, checkin_to, checkout_from, checkout_to, booked_from, booked_to, limit, search, skip, booking_type, status, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
            // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);
            const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
            // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);
            const endBookedDate = booked_to ? new Date(booked_to) : null;
            // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);
            const limitNum = limit ? Number(limit) : 50;
            const offsetNum = skip ? Number(skip) : 0;
            const data = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "src.name as source_name", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`, [
                "hotel_reservation.booking_rooms",
                "hotel_reservation.room_types",
                "hotel_reservation.rooms",
            ]))
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere(function () {
                        this.where("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    });
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            })
                .orderBy("b.id", "desc")
                .limit(limitNum)
                .offset(offsetNum);
            const total = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                        .orWhere("g.first_name", "ilike", `%${search}%`)
                        .orWhere("g.email", "ilike", `%${search}%`);
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            });
            return {
                data,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    getAllIndividualBooking({ hotel_code, checkin_from, checkin_to, checkout_from, checkout_to, booked_from, booked_to, limit, search, skip, booking_type, status, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
            // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);
            const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
            // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);
            const endBookedDate = booked_to ? new Date(booked_to) : null;
            // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);
            const limitNum = limit ? Number(limit) : 50;
            const offsetNum = skip ? Number(skip) : 0;
            const data = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "src.name as source_name", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`, [
                "hotel_reservation.booking_rooms",
                "hotel_reservation.room_types",
                "hotel_reservation.rooms",
            ]))
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.is_individual_booking", true)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere(function () {
                        this.where("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    });
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            })
                .orderBy("b.id", "desc")
                .limit(limitNum)
                .offset(offsetNum);
            const total = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.is_individual_booking", true)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                        .orWhere("g.first_name", "ilike", `%${search}%`)
                        .orWhere("g.email", "ilike", `%${search}%`);
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            });
            return {
                data,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    getAllGroupBooking({ hotel_code, checkin_from, checkin_to, checkout_from, checkout_to, booked_from, booked_to, limit, search, skip, booking_type, status, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const endCheckInDate = checkin_to ? new Date(checkin_to) : null;
            // if (endCheckInDate) endCheckInDate.setDate(endCheckInDate.getDate() + 1);
            const endCheckOutDate = checkout_to ? new Date(checkout_to) : null;
            // if (endCheckOutDate) endCheckOutDate.setDate(endCheckOutDate.getDate() + 1);
            const endBookedDate = booked_to ? new Date(booked_to) : null;
            // if (endBookedDate) endBookedDate.setDate(endBookedDate.getDate() + 1);
            const limitNum = limit ? Number(limit) : 50;
            const offsetNum = skip ? Number(skip) : 0;
            const data = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "src.name as source_name", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'id', br.id,
              'room_type_id', br.room_type_id,
              'room_type_name', rt.name,
              'room_id', br.room_id,
              'room_name', r.room_name,
              'adults', br.adults,
              'children', br.children,
              'infant', br.infant
             
            ))
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`, [
                "hotel_reservation.booking_rooms",
                "hotel_reservation.room_types",
                "hotel_reservation.rooms",
            ]))
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.is_individual_booking", false)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere(function () {
                        this.where("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    });
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            })
                .orderBy("b.id", "desc")
                .limit(limitNum)
                .offset(offsetNum);
            const total = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.is_individual_booking", false)
                .andWhere(function () {
                if (checkin_from && checkin_to) {
                    this.andWhereBetween("b.check_in", [checkin_from, endCheckInDate]);
                }
                if (checkout_from && checkout_to) {
                    this.andWhereBetween("b.check_out", [checkout_from, endCheckOutDate]);
                }
                if (booked_from && booked_to) {
                    this.andWhereBetween("b.booking_date", [booked_from, endBookedDate]);
                }
                if (search) {
                    this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                        .orWhere("g.first_name", "ilike", `%${search}%`)
                        .orWhere("g.email", "ilike", `%${search}%`);
                }
                if (status) {
                    this.andWhere("b.status", status);
                }
                if (booking_type) {
                    this.andWhere("b.booking_type", booking_type);
                }
            });
            return {
                data,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    getSingleBooking(hotel_code, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "src.name as source_name", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "b.service_charge_percentage", "b.vat_percentage", "b.payment_status", "b.comments", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone", "g.address", "c.country_name", "g.passport_number", "c.nationality", this.db.raw(`(
            SELECT json_agg(
              json_build_object(

                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant,
                'base_rate', br.base_rate,
                'changed_rate', br.changed_rate,
                'unit_base_rate', br.unit_base_rate,
                'unit_changed_rate', br.unit_changed_rate,
                'check_in',br.check_in,
                'check_out',br.check_out,
                'status',br.status,
                'room_guests', (
                  SELECT COALESCE(
                    json_agg(
                      json_build_object(
                        'guest_id', gg.id,
                        'first_name', gg.first_name,
                        'last_name', gg.last_name,
                        'email', gg.email,
                        'phone', gg.phone,
                        'address', gg.address,
                        'country', c.country_name,
                        'nationality', c.nationality
                      )
                    ),
                    '[]'::json
                  )
                  FROM hotel_reservation.booking_room_guest AS brg
                  JOIN hotel_reservation.guests AS gg ON brg.guest_id = gg.id
                  LEFT JOIN public.country AS c ON gg.country_id = c.id
                  WHERE brg.booking_room_id = br.id
                )
              )
            )
            FROM ?? AS br
            LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
            LEFT JOIN ?? AS r ON br.room_id = r.id
            WHERE br.booking_id = b.id
          ) AS booking_rooms`, [
                `${this.RESERVATION_SCHEMA}.booking_rooms`,
                `${this.RESERVATION_SCHEMA}.room_types`,
                `${this.RESERVATION_SCHEMA}.rooms`,
            ]))
                .leftJoin("sources as src", "b.source_id", "src.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .joinRaw("left join public.country c on g.country_id = c.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.id", booking_id)
                .first();
        });
    }
    updateRoomBooking(payload, hotel_code, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere({ id: booking_id });
        });
    }
    deleteBookingRooms(room_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .whereIn("room_id", room_ids);
        });
    }
    getLastBooking() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .limit(1)
                .orderBy("id", "desc");
        });
    }
    updateRoomAvailabilityHold({ hotel_code, room_type_id, date, rooms_to_book, type, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type == "hold_increase") {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms - ?", [rooms_to_book]),
                    hold_rooms: this.db.raw("hold_rooms + ?", [rooms_to_book]),
                    updated_at: this.db.fn.now(),
                });
            }
            else {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms + ?", [rooms_to_book]),
                    hold_rooms: this.db.raw("hold_rooms - ?", [rooms_to_book]),
                    updated_at: this.db.fn.now(),
                });
            }
        });
    }
    updateRoomAvailability({ type, hotel_code, room_type_id, date, rooms_to_book, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === "booked_room_increase") {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms - ?", [rooms_to_book]),
                    booked_rooms: this.db.raw("booked_rooms + ?", [rooms_to_book]),
                    updated_at: this.db.fn.now(),
                });
            }
            else {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms + ?", [rooms_to_book]),
                    booked_rooms: this.db.raw("booked_rooms - ?", [rooms_to_book]),
                    updated_at: this.db.fn.now(),
                });
            }
        });
    }
    getArrivalDepStayBookings({ current_date, hotel_code, booking_mode, limit, skip, search, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (booking_mode == "arrival") {
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .count("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_in", current_date)
                    .andWhere("b.status", "confirmed")
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .first();
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "src.name as source_name", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`, [
                    "hotel_reservation.booking_rooms",
                    "hotel_reservation.room_types",
                    "hotel_reservation.rooms",
                ]))
                    .leftJoin("sources as src", "b.source_id", "src.id")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_in", current_date)
                    .andWhere("b.status", "confirmed")
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0)
                    .orderBy("b.id", "desc");
                return {
                    data,
                    total: total ? parseInt(total.total) : 0,
                };
            }
            else if (booking_mode == "departure") {
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "src.name as source_name", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`, [
                    "hotel_reservation.booking_rooms",
                    "hotel_reservation.room_types",
                    "hotel_reservation.rooms",
                ]))
                    .leftJoin("sources as src", "b.source_id", "src.id")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.check_out", current_date)
                    .andWhere("b.status", "checked_in")
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0)
                    .orderBy("b.id", "desc");
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .count("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere("b.status", "checked_in")
                    .andWhere("b.check_out", current_date)
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .first();
                return {
                    data,
                    total: total ? parseInt(total.total) : 0,
                };
            }
            else {
                const data = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "src.name as source_name", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
            (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', br.id,
                'room_type_id', br.room_type_id,
                'room_type_name', rt.name,
                'room_id', br.room_id,
                'room_name', r.room_name,
                'adults', br.adults,
                'children', br.children,
                'infant', br.infant
              )), '[]'::json)
              FROM ?? AS br
              LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
              LEFT JOIN ?? AS r ON br.room_id = r.id
              WHERE br.booking_id = b.id
            ) AS booking_rooms`, [
                    "hotel_reservation.booking_rooms",
                    "hotel_reservation.room_types",
                    "hotel_reservation.rooms",
                ]))
                    .leftJoin("sources as src", "b.source_id", "src.id")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere(function () {
                    this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
                })
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .andWhere("b.status", "checked_in")
                    .limit(limit ? parseInt(limit) : 50)
                    .offset(skip ? parseInt(skip) : 0)
                    .orderBy("b.id", "desc");
                const total = yield this.db("bookings as b")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .count("b.id as total")
                    .leftJoin("guests as g", "b.guest_id", "g.id")
                    .where("b.hotel_code", hotel_code)
                    .andWhere(function () {
                    this.where("b.check_out", ">", current_date).andWhere("b.check_in", "<=", current_date);
                })
                    .andWhere(function () {
                    if (search) {
                        this.andWhere("b.booking_reference", "ilike", `%${search}%`)
                            .orWhere("g.first_name", "ilike", `%${search}%`)
                            .orWhere("g.email", "ilike", `%${search}%`);
                    }
                })
                    .andWhere("b.status", "checked_in")
                    .first();
                return {
                    data,
                    total: total ? parseInt(total.total) : 0,
                };
            }
        });
    }
}
exports.ReservationModel = ReservationModel;
//# sourceMappingURL=reservation.model.js.map