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
class RestaurantHotelModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAllBooking({ hotel_code, limit, search, skip, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const limitNum = limit ? Number(limit) : 50;
            const offsetNum = skip ? Number(skip) : 0;
            const data = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id as booking_id", "b.hotel_code", "b.booking_reference", this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`), "b.booking_type", "b.status", "b.is_individual_booking", "g.id as guest_id", this.db.raw(`CONCAT(g.first_name, ' ', g.last_name) as guest_name`), "g.email as guest_email", "g.phone as guest_phone")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
                .leftJoin("room_types as rt", "br.room_type_id", "rt.id")
                .leftJoin("rooms as r", "br.room_id", "r.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.booking_type", "B")
                .andWhere("b.status", "checked_in")
                .andWhere(function () {
                if (search) {
                    this.andWhere(function () {
                        this.where("b.booking_reference", "ilike", `%${search}%`).orWhere("g.phone", "ilike", `%${search}%`);
                    });
                }
            })
                .orderBy("b.id", "desc")
                .limit(limitNum)
                .offset(offsetNum);
            const total = yield this.db("bookings as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .countDistinct("b.id as total")
                .leftJoin("guests as g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.booking_type", "B")
                .andWhere("b.status", "checked_in")
                .andWhere(function () {
                if (search) {
                    this.andWhere(function () {
                        this.where("b.booking_reference", "ilike", `%${search}%`).orWhere("g.phone", "ilike", `%${search}%`);
                    });
                }
            });
            return {
                data,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    // public async getBookingRoomsByBookingRef({
    //   hotel_code,
    //   limit,
    //   search,
    //   skip,
    // }: {
    //   hotel_code: number;
    //   limit?: string;
    //   skip?: string;
    //   search?: string;
    // }) {
    //   const limitNum = limit ? Number(limit) : 50;
    //   const offsetNum = skip ? Number(skip) : 0;
    //   const data = await this.db("bookings as b")
    //     .withSchema(this.RESERVATION_SCHEMA)
    //     .select(
    //       "b.id as booking_id",
    //       "b.hotel_code",
    //       "b.booking_reference",
    //       this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
    //       this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
    //       "b.booking_type",
    //       "b.status",
    //       "b.is_individual_booking",
    //       "g.id as guest_id",
    //       this.db.raw(`CONCAT(g.first_name, ' ', g.last_name) as guest_name`),
    //       "g.email as guest_email",
    //       "g.phone as guest_phone",
    //       "br.id as booking_room_id",
    //       "br.room_id",
    //       "r.room_name",
    //       "br.room_type_id",
    //       "rt.name as room_type_name"
    //     )
    //     .leftJoin("guests as g", "b.guest_id", "g.id")
    //     .leftJoin("booking_rooms as br", "b.id", "br.booking_id")
    //     .leftJoin("room_types as rt", "br.room_type_id", "rt.id")
    //     .leftJoin("rooms as r", "br.room_id", "r.id")
    //     .where("b.hotel_code", hotel_code)
    //     .andWhere("b.booking_type", "B")
    //     .andWhere("b.status", "checked_in")
    //     .andWhere(function () {
    //       if (search) {
    //         this.andWhere(function () {
    //           this.where("b.booking_reference", "ilike", `%${search}%`).orWhere(
    //             "g.phone",
    //             "ilike",
    //             `%${search}%`
    //           );
    //         });
    //       }
    //     })
    //     .orderBy("b.id", "desc")
    //     .limit(limitNum)
    //     .offset(offsetNum);
    //   const total = await this.db("bookings as b")
    //     .withSchema(this.RESERVATION_SCHEMA)
    //     .countDistinct("b.id as total")
    //     .leftJoin("guests as g", "b.guest_id", "g.id")
    //     .where("b.hotel_code", hotel_code)
    //     .andWhere("b.booking_type", "B")
    //     .andWhere("b.status", "checked_in")
    //     .andWhere(function () {
    //       if (search) {
    //         this.andWhere(function () {
    //           this.where("b.booking_reference", "ilike", `%${search}%`).orWhere(
    //             "g.phone",
    //             "ilike",
    //             `%${search}%`
    //           );
    //         });
    //       }
    //     });
    //   return {
    //     data,
    //     total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    //   };
    // }
    getBookingRoomsByBookingRef({ booking_ref, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms as br")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("br.id", "br.room_id", "r.room_name")
                .leftJoin("bookings as b", "br.booking_id", "b.id")
                .leftJoin("rooms as r", "br.room_id", "r.id")
                .where("b.booking_reference", booking_ref)
                .andWhere("b.hotel_code", hotel_code);
        });
    }
}
exports.default = RestaurantHotelModel;
//# sourceMappingURL=restaurant.hotel.model.js.map