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
exports.BtocReservationModel = void 0;
const schema_1 = __importDefault(require("../../../utils/miscellaneous/schema"));
class BtocReservationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    searchAvailableRoomsBTOC(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, checkin, checkout, rooms, nights } = payload;
            const totalRequested = rooms.length;
            const roomTypes = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id as room_type_id", "rt.name as room_type_name", "rt.description", "rt.max_adults", "rt.max_children", this.db.raw(`MIN(ra.available_rooms) AS available_count`), "rp.id as rate_plan_id", "rp.name as rate_plan_name", "rpd.base_rate", this.db.raw(`COALESCE(meals.meal_list, '[]')::json AS boarding_details`))
                .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
                .leftJoin("rate_plan_details as rpd", "rt.id", "rpd.room_type_id")
                .leftJoin("rate_plans as rp", "rpd.rate_plan_id", "rp.id")
                .leftJoin(this.db
                .select("rpmp.rate_plan_id")
                .from("hotel_reservation.rate_plan_meal_mappings as rpmp")
                .leftJoin("hotel_reservation.meal_plans as mp", "rpmp.meal_plan_id", "mp.id")
                .groupBy("rpmp.rate_plan_id")
                .select(this.db.raw("json_agg(mp.name)::text as meal_list"))
                .as("meals"), "meals.rate_plan_id", "rp.id")
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
                .andWhere("ra.date", ">=", checkin)
                .andWhere("ra.date", "<", checkout)
                .groupBy("rt.id", "rt.name", "rt.description", "rt.max_adults", "rt.max_children", "rp.id", "rp.name", "rpd.base_rate", "meals.meal_list")
                .havingRaw("MIN(ra.available_rooms) >= ?", [totalRequested]);
            const grouped = {};
            const result = {};
            for (const r of roomTypes) {
                if (r.rate_plan_id) {
                    if (!grouped[r.room_type_id]) {
                        grouped[r.room_type_id] = {
                            room_type_id: r.room_type_id,
                            room_type_name: r.room_type_name,
                            description: r.description,
                            max_adults: r.max_adults,
                            max_children: r.max_children,
                            available_count: Number(r.available_count),
                            rate_plans: [],
                        };
                    }
                    grouped[r.room_type_id].rate_plans.push({
                        rate_plan_id: r.rate_plan_id,
                        rate_plan_name: r.rate_plan_name,
                        boarding_details: r.boarding_details,
                        base_rate: Number(r.base_rate),
                    });
                }
            }
            for (const rt of Object.values(grouped)) {
                let isValid = true;
                // Validate capacity
                for (const room of rooms) {
                    if (room.adults > rt.max_adults ||
                        room.children_ages.length > rt.max_children) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) {
                    delete grouped[rt.room_type_id];
                    continue;
                }
                let minRatePlan = null;
                for (const rp of rt.rate_plans) {
                    const totalPrice = rp.base_rate * totalRequested * nights;
                    const ratePlan = {
                        rate_plan_id: rp.rate_plan_id,
                        rate_plan_name: rp.rate_plan_name,
                        boarding_details: rp.boarding_details,
                        price: totalPrice,
                        no_of_rooms: totalRequested,
                        rooms: rooms.map((room) => ({
                            no_of_adults: room.adults,
                            no_of_children: room.children_ages.length,
                            no_of_rooms: 1,
                            description: rt.description,
                            room_type: rt.room_type_name,
                        })),
                        cancellation_policy: {},
                    };
                    if (!minRatePlan || totalPrice < minRatePlan.price) {
                        minRatePlan = ratePlan;
                    }
                }
                result[rt.room_type_id] = {
                    room_type_id: rt.room_type_id,
                    room_type_name: rt.room_type_name,
                    description: rt.description,
                    max_adults: rt.max_adults,
                    max_children: rt.max_children,
                    available_count: rt.available_count,
                    min_rate: minRatePlan,
                };
                // rt.min_rate = minRatePlan || undefined;
            }
            return Object.values(result);
        });
    }
    getAllRoomRatesBTOC(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, checkin, checkout, rooms, nights } = payload;
            const totalRequested = rooms.length;
            const roomTypes = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id as room_type_id", "rt.name as room_type_name", "rt.description", "rt.max_adults", "rt.max_children", this.db.raw(`MIN(ra.available_rooms) AS available_count`), "rp.id as rate_plan_id", "rp.name as rate_plan_name", "rpd.base_rate", this.db.raw(`COALESCE(meals.meal_list, '[]')::json AS boarding_details`))
                .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
                .leftJoin("rate_plan_details as rpd", "rt.id", "rpd.room_type_id")
                .leftJoin("rate_plans as rp", "rpd.rate_plan_id", "rp.id")
                .leftJoin(this.db
                .select("rpmp.rate_plan_id")
                .from("hotel_reservation.rate_plan_meal_mappings as rpmp")
                .leftJoin("hotel_reservation.meal_plans as mp", "rpmp.meal_plan_id", "mp.id")
                .groupBy("rpmp.rate_plan_id")
                .select(this.db.raw("json_agg(mp.name)::text as meal_list"))
                .as("meals"), "meals.rate_plan_id", "rp.id")
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
                .andWhere("ra.date", ">=", checkin)
                .andWhere("ra.date", "<", checkout)
                .groupBy("rt.id", "rt.name", "rt.description", "rt.max_adults", "rt.max_children", "rp.id", "rp.name", "rpd.base_rate", "meals.meal_list")
                .havingRaw("MIN(ra.available_rooms) >= ?", [totalRequested]);
            const grouped = {};
            for (const r of roomTypes) {
                if (r.rate_plan_id) {
                    if (!grouped[r.room_type_id]) {
                        grouped[r.room_type_id] = {
                            room_type_id: r.room_type_id,
                            room_type_name: r.room_type_name,
                            description: r.description,
                            max_adults: r.max_adults,
                            max_children: r.max_children,
                            available_count: Number(r.available_count),
                            rate_plans: [],
                        };
                    }
                    grouped[r.room_type_id].rate_plans.push({
                        rate_plan_id: r.rate_plan_id,
                        rate_plan_name: r.rate_plan_name,
                        boarding_details: r.boarding_details,
                        base_rate: Number(r.base_rate),
                    });
                }
            }
            const result = [];
            for (const rt of Object.values(grouped)) {
                let isValid = true;
                for (const room of rooms) {
                    if (room.adults > rt.max_adults ||
                        room.children_ages.length > rt.max_children) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid)
                    continue;
                const ratePlans = rt.rate_plans.map((rp) => {
                    const totalPrice = rp.base_rate * totalRequested * nights;
                    return {
                        rate_plan_id: rp.rate_plan_id,
                        rate_plan_name: rp.rate_plan_name,
                        boarding_details: rp.boarding_details,
                        base_rate: rp.base_rate,
                        total_price: totalPrice,
                        no_of_rooms: totalRequested,
                        rooms: rooms.map((room) => ({
                            no_of_adults: room.adults,
                            no_of_children: room.children_ages.length,
                            no_of_rooms: 1,
                            description: rt.description,
                            room_type: rt.room_type_name,
                        })),
                        cancellation_policy: {},
                    };
                });
                result.push({
                    room_type_id: rt.room_type_id,
                    room_type_name: rt.room_type_name,
                    description: rt.description,
                    max_adults: rt.max_adults,
                    max_children: rt.max_children,
                    available_count: rt.available_count,
                    room_rates: ratePlans,
                });
            }
            return result;
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
                .select("id", "room_id", "unit_base_rate", "unit_changed_rate", "base_rate", "changed_rate", this.db.raw(`TO_CHAR(check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(check_out, 'YYYY-MM-DD') as check_out`))
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
                .select("id", "room_id", "unit_base_rate", "unit_changed_rate", "base_rate", "changed_rate", this.db.raw(`TO_CHAR(check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(check_out, 'YYYY-MM-DD') as check_out`), "room_type_id")
                .where({
                booking_id,
                room_id,
            })
                .first();
        });
    }
    updateSingleBookingRoom(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
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
                .where("booking_id", where.booking_id)
                .andWhere(function () {
                if (where.exclude_checkout) {
                    this.andWhereNot("status", "checked_out");
                }
            });
        });
    }
    insertBookingRoomGuest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_room_guest")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    deleteBookingRoomGuest({ booking_room_id, guest_ids, booking_room_ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_room_guest")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .where(function () {
                if (booking_room_id) {
                    this.where({ booking_room_id });
                }
                if (booking_room_ids === null || booking_room_ids === void 0 ? void 0 : booking_room_ids.length) {
                    this.whereIn("booking_room_id", booking_room_ids);
                }
                if (guest_ids === null || guest_ids === void 0 ? void 0 : guest_ids.length) {
                    this.whereIn("guest_id", guest_ids);
                }
            });
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
                .select("b.id", "b.hotel_code", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
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
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
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
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone as guest_phone", this.db.raw(`(
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
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.is_individual_booking", "b.voucher_no", "b.source_id", "src.name as source_name", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "b.service_charge_percentage", "b.vat_percentage", "b.payment_status", "b.comments", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", "g.phone", "g.address", "c.country_name", "g.passport_no", "c.nationality", this.db.raw(`(
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
                'cbf',br.cbf,
                'base_rate', br.base_rate,
                'changed_rate', br.changed_rate,
                'unit_base_rate', br.unit_base_rate,
                'unit_changed_rate', br.unit_changed_rate,
             'check_in',  br.check_in::date,
             'check_out', br.check_out::date,
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
                        'nationality', c.nationality,
                        'is_room_primary_guest', brg.is_room_primary_guest
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
    deleteBookingRooms(room_ids, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .whereIn("room_id", room_ids)
                .andWhere("booking_id", booking_id);
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
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.total_amount", "b.vat", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
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
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
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
                    .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.status", "b.source_id", "src.name as source_name", "b.company_name", "b.pickup", "b.pickup_from", "b.pickup_time", "b.drop", "b.drop_time", "b.drop_to", "b.visit_purpose", "b.comments", "b.total_amount", "b.vat", "b.discount_amount", "b.service_charge", "g.id as guest_id", "g.first_name", "g.last_name", "g.email as guest_email", this.db.raw(`
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
exports.BtocReservationModel = BtocReservationModel;
//# sourceMappingURL=btoc.reservation.model.js.map