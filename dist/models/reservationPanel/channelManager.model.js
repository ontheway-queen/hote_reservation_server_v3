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
class ChannelManagerModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAllTodayAvailableRoomsTypeWithRoomCount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, check_in, check_out, room_type_id } = payload;
            console.log({ payload });
            return yield this.db("room_types as rt")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("rt.id", "rt.name", "rt.description", "rt.hotel_code", this.db.raw(`MIN(ra.available_rooms) AS available_rooms`), this.db.raw(`
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'rate_plan_id', rp.id,
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
                .andWhere("ra.date", "<=", check_out)
                .andWhere(function () {
                if (room_type_id) {
                    this.andWhere("rt.id", room_type_id);
                }
            })
                .groupBy("rt.id", "rt.name", "rt.description", "rt.hotel_code")
                .having(this.db.raw("MIN(ra.available_rooms) > 0"));
        });
    }
    addChannelManager(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels").withSchema(this.CM_SCHEMA).insert(payload);
        });
    }
    getAllChannelManager({ hotel_code, is_internal, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels")
                .withSchema(this.CM_SCHEMA)
                .select("id", "name", "is_internal")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (is_internal) {
                    this.andWhere("is_internal", is_internal);
                }
            });
        });
    }
    getSingleChannel(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels")
                .withSchema(this.CM_SCHEMA)
                .select("*")
                .where({ id })
                .andWhere({ hotel_code })
                .first();
        });
    }
    updateChannelManager(payload, conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels")
                .withSchema(this.CM_SCHEMA)
                .update(payload)
                .where(conditions);
        });
    }
    insertInChannelAllocation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channel_allocations")
                .withSchema(this.CM_SCHEMA)
                .insert(payload);
        });
    }
    updateRoomAvailabilityForChannelAllocation({ type, hotel_code, room_type_id, date, total_rooms, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === "allocate") {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms - ?", [total_rooms]),
                    channel_manager_rooms: this.db.raw("channel_manager_rooms + ?", [
                        total_rooms,
                    ]),
                    updated_at: this.db.fn.now(),
                });
            }
            else {
                return yield this.db("room_availability")
                    .withSchema(this.RESERVATION_SCHEMA)
                    .where({ hotel_code, room_type_id, date })
                    .update({
                    available_rooms: this.db.raw("available_rooms + ?", [total_rooms]),
                    channel_manager_rooms: this.db.raw("channel_manager_rooms - ?", [
                        total_rooms,
                    ]),
                    updated_at: this.db.fn.now(),
                });
            }
        });
    }
    insertInChannelRatePlans(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channel_rate_plans")
                .withSchema(this.CM_SCHEMA)
                .insert(payload);
        });
    }
    bulkUpdateRoomAvailabilityForChannel({ type, hotel_code, room_type_id, updates, // [{ date: string, total_rooms: number }]
     }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!updates.length)
                return;
            // build CASE statements for available_rooms and channel_manager_rooms
            const availableCases = [];
            const channelCases = [];
            const dates = [];
            updates.forEach((u) => {
                dates.push(u.date);
                if (type === "allocate") {
                    availableCases.push(`WHEN date = '${u.date}' THEN available_rooms - ${u.total_rooms}`);
                    channelCases.push(`WHEN date = '${u.date}' THEN channel_manager_rooms + ${u.total_rooms}`);
                }
                else {
                    availableCases.push(`WHEN date = '${u.date}' THEN available_rooms + ${u.total_rooms}`);
                    channelCases.push(`WHEN date = '${u.date}' THEN channel_manager_rooms - ${u.total_rooms}`);
                }
            });
            const rawQuery = `
    UPDATE ${this.RESERVATION_SCHEMA}.room_availability
    SET
      available_rooms = CASE ${availableCases.join(" ")} ELSE available_rooms END,
      channel_manager_rooms = CASE ${channelCases.join(" ")} ELSE channel_manager_rooms END,
      updated_at = NOW()
    WHERE hotel_code = ${hotel_code}
      AND room_type_id = ${room_type_id}
      AND date IN (${dates.map((d) => `'${d}'`).join(",")});
  `;
            return yield this.db.raw(rawQuery);
        });
    }
    getSingleChannelAllocation({ hotel_code, room_type_id, channel_id, date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channel_allocations")
                .select("id", "room_type_id", "channel_id", "date", "allocated_rooms")
                .where({ hotel_code, room_type_id, channel_id, date })
                .withSchema(this.CM_SCHEMA)
                .first();
        });
    }
    updateChannelAllocation({ id, allocated_rooms, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channel_allocations")
                .withSchema(this.CM_SCHEMA)
                .where({ id })
                .update({ allocated_rooms, updated_at: new Date() });
        });
    }
    getChannelRoomAllocations({ hotel_code, current_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("channels as c")
                .withSchema(this.CM_SCHEMA)
                .select("c.id as channel_id", "c.name as channel_name", this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'room_type_id', rt.id,
              'room_type_name', rt.name,
              'allocated_rooms', ca.allocated_rooms,
              'sold_rooms', ca.sold_rooms
            )
          ) FILTER (WHERE rt.id IS NOT NULL), '[]'
        ) as room_types
        `))
                .leftJoin(`channel_allocations as ca`, function () {
                this.on("ca.channel_id", "c.id")
                    .andOn("ca.hotel_code", "c.hotel_code")
                    .andOnVal("ca.date", current_date);
            })
                .joinRaw("LEFT JOIN hotel_reservation.room_types as rt ON rt.id=ca.room_type_id")
                .where("c.hotel_code", hotel_code)
                .groupBy("c.id", "c.name");
        });
    }
}
exports.default = ChannelManagerModel;
//# sourceMappingURL=channelManager.model.js.map