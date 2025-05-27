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
    // get all available rooms with types by checkn and check out dates
    getAllAvailableRoomsTypeWithAvailableRoomCount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out } = payload;
            return yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.description", "rt.base_price", "rt.hotel_code", this.db.raw(`COALESCE(SUM(ra.available_rooms), 0) AS available_rooms`))
                .leftJoin("room_availability as ra", "rt.id", "ra.room_type_id")
                .where("rt.hotel_code", hotel_code)
                .andWhere("ra.date", ">=", check_in)
                .andWhere("ra.date", "<", check_out)
                .groupBy("rt.id");
        });
    }
    getAllAvailableRoomsByRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out, room_type_id } = payload;
            console.log({ payload });
            const schema = this.RESERVATION_SCHEMA;
            return yield this.db("rooms as r")
                .withSchema(schema)
                .select("r.hotel_code", "r.id as room_id", "r.room_name", "r.room_type_id", "rt.name as room_type_name", "rt.base_price as room_type_base_price")
                .leftJoin("room_types as rt", "r.room_type_id", "rt.id")
                .where("r.hotel_code", hotel_code)
                .andWhere("r.room_type_id", room_type_id)
                .whereNotExists(function () {
                this.select("*")
                    .from("bookings as b")
                    .withSchema(schema)
                    .join("booking_rooms as br", "br.booking_id", "b.id")
                    .whereRaw("br.room_id = r.id")
                    .andWhere("b.status", "confirmed")
                    .andWhere("b.check_in", "<", check_out)
                    .andWhere("b.check_out", ">", check_in);
            });
        });
    }
    insertRoomBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_booking")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // insert booking rooms
    insertBookingRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
}
exports.ReservationModel = ReservationModel;
//# sourceMappingURL=reservation.model.js.map