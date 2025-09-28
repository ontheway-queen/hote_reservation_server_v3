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
class GuestModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createGuest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("guests")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    createGuestForGroupBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("guests")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllGuestEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, hotel_code } = payload;
            const dtbs = this.db("user");
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ "user.hotel_code": hotel_code })
                .andWhere({ "user.email": email })
                .orderBy("id", "desc");
            return { data };
        });
    }
    insertGuestLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("guest_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getUserLedgerLastId(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, user_id } = payload;
            return yield this.db("guest_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .where({ hotel_code })
                .andWhere({ user_id })
                .limit(1)
                .orderBy("id", "desc");
        });
    }
    getGuestLastBalance({ guest_id, hotel_code, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db("guest_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .select(this.db.raw("COALESCE(SUM(credit),0) - COALESCE(SUM(debit),0) as balance"))
                .where({ guest_id, hotel_code });
            const balance = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.balance) || 0;
        });
    }
    getAllGuest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, limit, skip, phone, email, status } = payload;
            const dtbs = this.db("guests as g");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("g.id", "g.first_name", "g.last_name", "g.email", "g.address", "g.phone", "c.country_name as country", "c.nationality", "g.is_active", "g.created_at")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("g.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("g.first_name", "like", `%${key}%`)
                        .orWhere("g.email", "like", `%${key}%`)
                        .orWhere("g.phone", "like", `%${key}%`);
                }
                if (phone) {
                    this.andWhere("g.phone", "like", `%${phone}%`);
                }
                if (email) {
                    this.andWhere("g.email", email);
                }
                if (status) {
                    this.andWhere("g.is_active", status);
                }
            })
                .orderBy("g.id", "desc");
            const total = yield this.db("guests as g")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("g.id as total")
                .where("g.hotel_code", hotel_code)
                .andWhere(function () {
                if (key) {
                    this.andWhere("g.first_name", "like", `%${key}%`)
                        .orWhere("g.email", "like", `%${key}%`)
                        .orWhere("g.phone", "like", `%${key}%`);
                }
                if (phone) {
                    this.andWhere("g.phone", "like", `%${phone}%`);
                }
                if (email) {
                    this.andWhere("g.email", email);
                }
                if (status) {
                    this.andWhere("g.is_active", status);
                }
            });
            return { data, total: total[0].total };
        });
    }
    getSingleGuest(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, id, hotel_code } = where;
            return yield this.db("guests")
                .select("*")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ hotel_code })
                .where(function () {
                if (id) {
                    this.where("id", id);
                }
                if (email) {
                    this.where("email", email);
                }
            });
        });
    }
    updateSingleGuest(where, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = where;
            return yield this.db("guests")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    getSingleGuestLedeger({ guest_id, hotel_code, from_date, to_date, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const data = yield this.db("guest_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "guest_id", "debit", "credit", "ledger_date", "remarks")
                .where({ guest_id })
                .andWhere({ hotel_code })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.whereBetween("ledger_date", [from_date, endDate]);
                }
            })
                .limit(limit ? limit : 50)
                .offset(skip ? skip : 0);
            const total = yield this.db("guest_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where({ guest_id })
                .andWhere({ hotel_code })
                .andWhere(function () {
                if (from_date && to_date) {
                    this.whereBetween("ledger_date", [from_date, endDate]);
                }
            });
            return {
                data,
                total: total[0].total,
            };
        });
    }
    addGuestToRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("booking_room_guests")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
}
exports.default = GuestModel;
//# sourceMappingURL=guestModel.js.map