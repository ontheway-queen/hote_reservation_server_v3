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
                    const totalPrice = Number(rp.base_rate) * Number(totalRequested) * nights;
                    console.log({ nights, totalPrice });
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
                const minRate = Math.min(...ratePlans.map((rp) => rp.total_price));
                result.push({
                    room_type_id: rt.room_type_id,
                    room_type_name: rt.room_type_name,
                    description: rt.description,
                    max_adults: rt.max_adults,
                    max_children: rt.max_children,
                    available_count: rt.available_count,
                    price: minRate,
                    room_rates: ratePlans,
                });
            }
            return result;
        });
    }
    recheck(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, checkin, checkout, room_type_id, rate_plan_id, rooms, nights, } = payload;
            const totalRequested = rooms.length;
            const result = yield this.db("room_types as rt")
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
                .andWhere("rt.id", room_type_id)
                .andWhere("rp.id", rate_plan_id)
                .andWhere("ra.date", ">=", checkin)
                .andWhere("ra.date", "<", checkout)
                .groupBy("rt.id", "rt.name", "rt.description", "rt.max_adults", "rt.max_children", "rp.id", "rp.name", "rpd.base_rate", "meals.meal_list")
                .first();
            if (!result) {
                throw new Error("Room type or rate plan not found");
            }
            if (Number(result.available_count) < totalRequested) {
                throw new Error("Not enough rooms available");
            }
            for (const r of rooms) {
                if (r.adults > result.max_adults ||
                    r.children_ages.length > result.max_children) {
                    throw new Error("Guest count exceeds room capacity");
                }
            }
            const totalPrice = Number(result.base_rate) * totalRequested * nights;
            return {
                room_type_id: result.room_type_id,
                room_type_name: result.room_type_name,
                description: result.description,
                max_adults: result.max_adults,
                max_children: result.max_children,
                available_count: Number(result.available_count),
                price: totalPrice,
                rate: {
                    rate_plan_id: result.rate_plan_id,
                    rate_plan_name: result.rate_plan_name,
                    boarding_details: result.boarding_details,
                    base_rate: Number(result.base_rate),
                    total_price: totalPrice,
                    no_of_rooms: totalRequested,
                    rooms: rooms.map((room) => ({
                        no_of_adults: room.adults,
                        no_of_children: room.children_ages.length,
                        no_of_rooms: 1,
                        description: result.description,
                        room_type: result.room_type_name,
                    })),
                    cancellation_policy: {},
                },
            };
        });
    }
    insertBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertBookingRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllBooking({ hotel_code, search, user_id, limit, skip, booking_type, status, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("bookings as b");
            if (limit && skip) {
                dtbs.limit(Number(limit)).offset(Number(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.booking_reference", this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), "b.guest_id", "b.hotel_code", "b.sub_total", "b.total_amount", "b.total_nights", "b.comments", "b.booking_type", "b.status", "b.book_from")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.created_by", user_id)
                .andWhere(function () {
                if (search) {
                    this.where("b.booking_reference", "ilike", `%${search}%`);
                }
                if (booking_type) {
                    this.where("b.booking_type", booking_type);
                }
                if (status) {
                    this.where("b.status", status);
                }
            });
            const total = yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere("created_by", user_id)
                .andWhere(function () {
                if (search) {
                    this.where("booking_reference", "ilike", `%${search}%`);
                }
                if (booking_type) {
                    this.where("booking_type", booking_type);
                }
                if (status) {
                    this.where("status", status);
                }
            });
            return { total: Number(total[0].total), data };
        });
    }
    getSingleBooking({ hotel_code, ref_id, user_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.booking_reference", "b.booking_type", "b.status", "b.payment_status", "b.total_amount", "b.total_nights", this.db.raw("TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in"), this.db.raw("TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out"), this.db.raw("TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date"), this.db.raw(`
      JSON_BUILD_OBJECT(
        'title', g.title,
        'first_name', g.first_name,
        'last_name', g.last_name,
        'email', g.email,
        'phone', g.phone,
        'address', g.address
      ) as holder
    `), this.db.raw(`
      (
        SELECT JSON_AGG(
          JSON_BUILD_OBJECT(
            'room_type', rt.name,
            'adults', br.adults,
            'children', br.children,
            'guests',
              (
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'title', g2.title,
                    'name', g2.first_name,
                    'surname', g2.last_name
                  )
                )
                FROM hotel_reservation.booking_room_guest brg
                LEFT JOIN hotel_reservation.guests g2 ON brg.guest_id = g2.id
                WHERE brg.booking_room_id = br.id
              )
          )
        )
        FROM hotel_reservation.booking_rooms br
        LEFT JOIN hotel_reservation.room_types rt ON br.room_type_id = rt.id
        WHERE br.booking_id = b.id
      ) as rooms
    `))
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.booking_reference", ref_id)
                .andWhere("b.created_by", user_id)
                .first();
        });
    }
    cancelSingleBooking({ hotel_code, ref_id, user_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bookings")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("hotel_code", hotel_code)
                .update({ status: "canceled" })
                .andWhere("booking_reference", ref_id)
                .andWhere("created_by", user_id);
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
}
exports.BtocReservationModel = BtocReservationModel;
//# sourceMappingURL=btoc.reservation.model.js.map