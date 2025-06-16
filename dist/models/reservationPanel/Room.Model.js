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
class RoomModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create room
    createRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllRoom(payload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, room_type_id, search, exact_name, status, } = payload;
            const dtbs = this.db("rooms as r");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("r.id", "r.hotel_code", "r.room_name", "r.floor_no", "r.room_type_id", "r.status", "rt.name as room_type_name")
                .join("room_types as rt", "r.room_type_id", "rt.id")
                .where(function () {
                this.andWhere("r.hotel_code", hotel_code);
                if (exact_name) {
                    this.andWhereRaw("LOWER(r.room_name) = ?", [
                        exact_name.toLowerCase(),
                    ]);
                }
                if (search) {
                    this.andWhere("r.room_name", "ilike", `%${search}%`);
                }
                if (room_type_id) {
                    this.andWhere("r.room_type_id", room_type_id);
                }
                if (status) {
                    this.andWhere("r.status", status);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("rooms as r")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("r.id as total")
                .join("room_types as rt", "r.room_type_id", "rt.id")
                .where(function () {
                if (search) {
                    this.andWhere("r.room_name", "ilike", `%${search}%`);
                }
                if (exact_name) {
                    this.andWhereRaw("LOWER(r.room_name) = ?", [
                        exact_name.toLowerCase(),
                    ]);
                }
                if (room_type_id) {
                    this.andWhere("r.room_type_id", room_type_id);
                }
                if (status) {
                    this.andWhere("r.status", status);
                }
            });
            return {
                data,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    getAllAvailableRooms(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, adult, child, check_in, check_out, limit, skip } = payload;
            const totalGuests = (adult !== null && adult !== void 0 ? adult : 1) + (child !== null && child !== void 0 ? child : 0);
            console.log({ totalGuests });
            // Calculate number of nights
            const checkInDate = new Date(check_in);
            const checkOutDate = new Date(check_out);
            const number_of_nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            if (number_of_nights <= 0) {
                throw new Error("Invalid check-in and check-out date range");
            }
            const rooms = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.base_occupancy", "rt.max_occupancy", "rt.max_adults", "rt.max_children", "rt.base_price")
                .leftJoin("room_availability as ra", function () {
                this.on("ra.room_type_id", "=", "rt.id")
                    .andOn("ra.hotel_code", "=", "rt.hotel_code")
                    .andOnBetween("ra.date", [check_in, check_out]);
            })
                .where("rt.is_active", true)
                .andWhere("rt.is_available", true)
                .andWhere("rt.hotel_code", hotel_code)
                .andWhere("rt.base_occupancy", "<=", totalGuests)
                .andWhere("rt.max_occupancy", ">=", totalGuests)
                .andWhere("rt.max_adults", ">=", adult !== null && adult !== void 0 ? adult : 1)
                .andWhere("rt.max_children", ">=", child !== null && child !== void 0 ? child : 0)
                .groupBy("rt.id")
                .havingRaw("COUNT(ra.id) = ?", [number_of_nights])
                .havingRaw("MIN(ra.available_rooms) > 0")
                .orderBy("rt.name", "asc")
                .modify((qb) => {
                if (limit)
                    qb.limit(parseInt(limit));
                if (skip)
                    qb.offset(parseInt(skip));
            });
            return {
                data: rooms,
                total: rooms.length,
            };
        });
    }
    getAllRoomByRoomTypes(payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, room_type_id, search, exact_name } = payload;
            console.log("here");
            const dtbs = this.db("room_types as rt");
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.name as room_type_name", this.db.raw(`COALESCE(
          JSON_AGG(
            CASE
              WHEN r.id IS NOT NULL AND r.status != 'out_of_service' THEN
                JSON_BUILD_OBJECT('id', r.id, 'room_name', r.room_name, 'status', r.status)
            END
          ) FILTER (WHERE r.id IS NOT NULL AND r.status != 'out_of_service'),
          '[]'
        ) AS rooms`))
                .from("room_types as rt")
                .leftJoin("rooms as r", "rt.id", "r.room_type_id")
                .where("rt.is_active", true)
                .andWhere("rt.hotel_code", hotel_code)
                .groupBy("rt.id", "rt.name")
                .orderBy("rt.name", "asc");
            const total = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rt.id as total")
                .leftJoin("rooms as r", "rt.id", "r.room_type_id")
                .where("rt.is_active", true)
                .where("rt.hotel_code", hotel_code)
                .andWhereNot("r.status", "out_of_service")
                .orderBy("rt.name", "asc")
                .groupBy("rt.id", "r.room_type_id");
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    getSingleRoom(hotel_code, room_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where({ hotel_code })
                .andWhere({ id: room_id });
        });
    }
    insertInRoomAvilabilities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("room_availability")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    deleteInRoomAvailabilities({ hotel_code, room_type_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_availability")
                .withSchema(this.RESERVATION_SCHEMA)
                .del()
                .where({ hotel_code })
                .andWhere({ room_type_id });
        });
    }
    updateInRoomAvailabilities(hotel_code, room_type_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_availability")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere({ room_type_id });
        });
    }
    getRoomAvailabilitiesByRoomTypeId(hotel_code, room_type_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_availability")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "total_rooms", "available_rooms")
                .where("hotel_code", hotel_code)
                .andWhere("room_type_id", room_type_id)
                .first();
        });
    }
    // update hotel room
    updateRoom(roomId, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id: roomId })
                .andWhere({ hotel_code });
        });
    }
}
exports.default = RoomModel;
//# sourceMappingURL=Room.Model.js.map