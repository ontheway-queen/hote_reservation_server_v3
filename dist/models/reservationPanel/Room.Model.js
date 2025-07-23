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
            const { limit, skip, hotel_code, room_type_id, search, exact_name, status, room_ids, } = payload;
            const dtbs = this.db("rooms as r");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("r.id", "r.hotel_code", "r.room_name", "r.floor_no", "r.room_type_id", "r.status", "rt.name as room_type_name")
                .join("room_types as rt", "r.room_type_id", "rt.id")
                .andWhere("r.is_deleted", false)
                .andWhere(function () {
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
                if (room_ids === null || room_ids === void 0 ? void 0 : room_ids.length) {
                    this.whereIn("r.id", room_ids);
                }
            })
                .orderBy("r.room_name", "asc");
            const total = yield this.db("rooms as r")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("r.id as total")
                .join("room_types as rt", "r.room_type_id", "rt.id")
                .where(function () {
                this.andWhere("r.hotel_code", hotel_code);
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
                if (room_ids === null || room_ids === void 0 ? void 0 : room_ids.length) {
                    this.whereIn("r.id", room_ids);
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
                .andWhere("rt.is_deleted", false)
                .andWhere("rt.hotel_code", hotel_code)
                .groupBy("rt.id", "rt.name")
                .orderBy("rt.name", "asc");
            const total = yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("rt.id as total")
                .leftJoin("rooms as r", "rt.id", "r.room_type_id")
                .where("rt.is_active", true)
                .where("rt.hotel_code", hotel_code)
                .andWhere("rt.is_deleted", false)
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
                .select("id", "room_name", "floor_no", "room_type_id", "status")
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
    updateInRoomAvailabilities(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                for (const update of updates) {
                    yield trx("room_availability")
                        .withSchema(this.RESERVATION_SCHEMA)
                        .where({
                        id: update.id,
                    })
                        .update({
                        total_rooms: update.total_rooms,
                        available_rooms: update.available_rooms,
                    });
                }
            }));
        });
    }
    getRoomAvailabilitiesByRoomTypeId(hotel_code, room_type_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("room_availability")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", this.db.raw(`TO_CHAR(date, 'YYYY-MM-DD') as date`), "total_rooms", "booked_rooms", "hold_rooms", "available_rooms")
                .where("hotel_code", hotel_code)
                .andWhere("room_type_id", room_type_id)
                .orderBy("date", "asc");
        });
    }
    updateRoom(roomId, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("rooms")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ id: roomId })
                .andWhere({ hotel_code });
        });
    }
    getAllRoomByRoomStatus(payload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, room_type_id, status, limit, skip, current_date } = payload;
            // old code which not suitable for sorting
            // const dtbs = this.db("rooms as r").withSchema(this.RESERVATION_SCHEMA);
            // const parsedLimit = parseInt(limit as string);
            // const parsedSkip = parseInt(skip as string);
            // if (!isNaN(parsedLimit) && !isNaN(parsedSkip)) {
            //   dtbs.limit(parsedLimit).offset(parsedSkip);
            // }
            // const data = await this.db
            //   .withSchema(this.RESERVATION_SCHEMA)
            //   .select(
            //     "r.floor_no",
            //     this.db.raw(
            //       `
            //   JSON_AGG(
            //     JSON_BUILD_OBJECT(
            //       'id', r.id,
            //       'hotel_code', r.hotel_code,
            //       'room_no', r.room_name,
            //       'floor_no', r.floor_no,
            //       'room_type_id', r.room_type_id,
            //       'status', r.status,
            //       'room_type_name', rt.name,
            //       'bookings', COALESCE((
            //         SELECT JSON_AGG(
            //           JSON_BUILD_OBJECT(
            //             'booking_id', b.id,
            //             'booking_reference', b.booking_reference,
            //             'check_in', b.check_in,
            //             'check_out', b.check_out,
            //             'booking_type', b.booking_type,
            //             'booking_status', b.status,
            //             'guest_first_name', g.first_name,
            //             'guest_last_name', g.last_name,
            //             'guest_id', g.id
            //           )
            //         )
            //         FROM hotel_reservation.booking_rooms br
            //         JOIN hotel_reservation.bookings b ON b.id = br.booking_id
            //         LEFT JOIN hotel_reservation.guests g ON g.id = b.guest_id
            //         WHERE br.room_id = r.id
            //         AND b.check_in <= ?
            //           AND b.check_out >= ?
            //           AND b.hotel_code = r.hotel_code
            //           AND b.booking_type = ?
            //           AND (b.status = ? OR b.status = ?)
            //       ), '[]')
            //     )
            //     ) AS rooms
            // `,
            //       [current_date, current_date, "B", "confirmed", "checked_in"]
            //     )
            //   )
            //   .from("rooms as r")
            //   .join("room_types as rt", "r.room_type_id", "rt.id")
            //   .where("r.hotel_code", hotel_code)
            //   .andWhere("r.is_deleted", false)
            //   .modify((qb) => {
            //     if (status) {
            //       qb.andWhere("r.status", status);
            //     }
            //     if (room_type_id) {
            //       qb.andWhere("r.room_type_id", room_type_id);
            //     }
            //   })
            //   .groupBy("r.floor_no")
            //   .orderBy("r.floor_no", "asc");
            // new code
            const data = yield this.db.raw(`
      SELECT
        floor_no,
        JSON_AGG(room_obj ORDER BY room_no_int) AS rooms
      FROM (
        SELECT
          r.floor_no,
          CAST(r.room_name AS INTEGER) AS room_no_int,
          JSON_BUILD_OBJECT(
            'id', r.id,
            'hotel_code', r.hotel_code,
            'room_no', r.room_name,
            'floor_no', r.floor_no,
            'room_type_id', r.room_type_id,
            'status', r.status,
            'room_type_name', rt.name,
            'bookings', COALESCE((
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'booking_id', b.id,
                  'booking_reference', b.booking_reference,
                  'check_in', b.check_in,
                  'check_out', b.check_out,
                  'booking_type', b.booking_type,
                  'booking_status', b.status,
                  'guest_first_name', g.first_name,
                  'guest_last_name', g.last_name,
                  'guest_id', g.id
                )
              )
              FROM ${this.RESERVATION_SCHEMA}.booking_rooms br
              JOIN ${this.RESERVATION_SCHEMA}.bookings b ON b.id = br.booking_id
              LEFT JOIN ${this.RESERVATION_SCHEMA}.guests g ON g.id = b.guest_id
              WHERE br.room_id = r.id
                AND b.check_in <= ?
                AND b.check_out >= ?
                AND b.hotel_code = r.hotel_code
                AND b.booking_type = ?
                AND (b.status = ? OR b.status = ?)
            ), '[]')
          ) AS room_obj
        FROM ${this.RESERVATION_SCHEMA}.rooms r
        JOIN ${this.RESERVATION_SCHEMA}.room_types rt ON r.room_type_id = rt.id
        WHERE r.hotel_code = ?
          AND r.is_deleted = false
          ${status ? `AND r.status = '${status}'` : ""}
          ${room_type_id ? `AND r.room_type_id = '${room_type_id}'` : ""}
      ) AS sorted_rooms
      GROUP BY floor_no
      ORDER BY floor_no ASC
    `, [current_date, current_date, "B", "confirmed", "checked_in", hotel_code]);
            const total = yield this.db("rooms as r")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("r.id as total")
                .join("room_types as rt", "r.room_type_id", "rt.id")
                .where("r.hotel_code", hotel_code)
                .andWhere("r.is_deleted", false)
                .where(function () {
                if (room_type_id) {
                    this.andWhere("r.room_type_id", room_type_id);
                }
                if (status) {
                    this.andWhere("r.status", status);
                }
            });
            return {
                data: data.rows,
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
            };
        });
    }
    // get all rooms by room type
    getAllRoomByRoomType(hotel_code, id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("rooms as r")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("r.id", "r.room_name", "r.floor_no", "r.status", "ua.id as created_by_id", "ua.name as created_by_name")
                .join("user_admin as ua", "ua.id", "r.created_by")
                .where("r.room_type_id", id)
                .andWhere("r.is_deleted", false)
                .andWhere("r.hotel_code", hotel_code);
            const total = yield this.db("rooms as r")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("r.id as total")
                .where("r.room_type_id", id)
                .andWhere("r.is_deleted", false)
                .andWhere("r.hotel_code", hotel_code);
            return {
                total: ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) ? parseInt((_b = total[0]) === null || _b === void 0 ? void 0 : _b.total) : 0,
                data,
            };
        });
    }
    // Get all occupied rooms using a specific date
    getAllOccupiedRooms(date, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.db("booking_rooms as br")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("r.id as room_id", "r.hotel_code", "r.room_name as room_no", "r.floor_no", "r.status", "rt.id as room_type_id", "rt.name as room_type_name", "bk.id as booking_id", "bk.booking_reference", "bk.check_in", "bk.check_out", "bk.booking_type", "bk.status as booking_status", "g.first_name as guest_first_name", "g.last_name as guest_last_name", "g.id as guest_id")
                .join("bookings as bk", "bk.id", "br.booking_id")
                .leftJoin("rooms as r", "r.id", "br.room_id")
                .leftJoin("guests as g", "g.id", "bk.guest_id")
                .join("room_types as rt", "rt.id", "br.room_type_id")
                .where((qb) => {
                qb.where("bk.status", "checked_in").orWhere("bk.status", "confirmed");
            })
                .andWhere("bk.hotel_code", hotel_code)
                .andWhere("bk.check_in", "<=", date)
                .andWhere("bk.check_out", ">", date)
                .andWhere("r.is_deleted", false)
                .orderBy("r.id", "asc");
            const grouped = rows.reduce((acc, row) => {
                let room = acc.find((r) => r.id === row.room_id);
                if (!room) {
                    room = {
                        id: row.room_id,
                        hotel_code: row.hotel_code,
                        room_no: row.room_no,
                        floor_no: row.floor_no,
                        room_type_id: row.room_type_id,
                        room_type_name: row.room_type_name,
                        status: row.status,
                        bookings: [],
                    };
                    acc.push(room);
                }
                room.bookings.push({
                    booking_id: row.booking_id,
                    booking_reference: row.booking_reference,
                    check_in: row.check_in,
                    check_out: row.check_out,
                    booking_type: row.booking_type,
                    booking_status: row.booking_status,
                    guest_first_name: row.guest_first_name,
                    guest_last_name: row.guest_last_name,
                    guest_id: row.guest_id,
                });
                return acc;
            }, []);
            return {
                total: grouped.length,
                data: grouped,
            };
        });
    }
}
exports.default = RoomModel;
//# sourceMappingURL=Room.Model.js.map