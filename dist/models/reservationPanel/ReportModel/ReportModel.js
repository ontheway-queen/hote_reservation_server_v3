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
class ReportModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getAccountsTransactions({ headIds, from_date, to_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(`${this.ACC_SCHEMA}.acc_vouchers AS av`)
                .select("av.id", "av.acc_head_id", "av.voucher_no", "av.voucher_date", "av.description", "av.debit", "av.credit", "ah.code AS acc_head_code", "ah.name AS acc_head_name", "ah.parent_id", "aph.name AS parent_acc_head_name", "ua.name AS created_by", "ag.name AS group_name", "av.created_at")
                .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS ah`, "av.acc_head_id", "ah.id")
                .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS aph`, {
                "aph.id": "ah.parent_id",
            })
                .leftJoin(`${this.RESERVATION_SCHEMA}.user_admin AS ua`, "av.created_by", "ua.id")
                .leftJoin(`${this.ACC_SCHEMA}.acc_groups AS ag`, "ah.group_code", "ag.code")
                .where("av.is_deleted", false)
                .andWhere((qb) => {
                if (Array.isArray(headIds) && headIds.length) {
                    qb.whereIn("av.acc_head_id", headIds);
                }
                if (from_date && to_date) {
                    qb.andWhereRaw("Date(av.voucher_date) BETWEEN ? AND ?", [
                        from_date,
                        to_date,
                    ]);
                }
            });
        });
    }
    getAccHeadInfo(head_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads AS ah")
                .withSchema(this.ACC_SCHEMA)
                .select("ah.id", "ah.parent_id", "ah.code", "ah.group_code", "ah.name", "ah.hotel_code")
                .where("id", head_id)
                .first();
        });
    }
    getAccHeads() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.db("acc_heads AS ah")
                .withSchema(this.ACC_SCHEMA)
                .select("ah.id", "ah.name", "ah.parent_id"));
        });
    }
    getTrialBalanceReport({ from_date, to_date, group_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as debit`;
            let subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as credit`;
            if (from_date && to_date) {
                subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as debit`;
                subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as credit`;
            }
            return yield this.db("acc_heads AS ah")
                .withSchema(this.ACC_SCHEMA)
                .select("ah.id", "ah.parent_id", "ah.code", "ah.group_code", "ah.name", "ag.name AS group_name", this.db.raw(subQueryDebit), this.db.raw(subQueryCredit))
                .leftJoin("acc_groups AS ag", { "ag.code": "ah.group_code" })
                .where((qb) => {
                if (group_code) {
                    qb.andWhere("ah.group_code", group_code);
                }
            });
        });
    }
    getAccHeadsForSelect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads AS ah")
                .withSchema(this.ACC_SCHEMA)
                .select("ah.id AS head_id", "ah.parent_id AS head_parent_id", "ah.code AS head_code", "ah.group_code AS head_group_code", "ah.name AS head_name", "aph.code AS parent_head_code", "aph.name AS parent_head_name")
                .leftJoin("acc_heads AS aph", { "aph.id": "ah.parent_id" })
                .where("ah.is_deleted", 0)
                .andWhere("ah.is_active", 1)
                .orderBy("ah.id", "asc");
        });
    }
    inhouseGuestListReport({ hotel_code, current_date, search, limit, room_id, skip, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("booking_rooms AS br");
            if (limit && skip) {
                dtbs.limit(parseInt(limit)).offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("br.id", "b.id as booking_id", "b.booking_reference", this.db.raw(`TO_CHAR(br.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(br.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.is_individual_booking", "b.status", "b.comments", "b.company_name", "b.visit_purpose", "r.id as room_id", "r.room_name as room_no", "r.floor_no", "br.cbf", "br.adults", "br.children as child_count", "br.infant", this.db.raw("COALESCE(brg.guest_id, b.guest_id) AS guest_id"), this.db.raw("COALESCE(brg.is_room_primary_guest, false) AS is_room_primary_guest"), this.db.raw("COALESCE(g.first_name, g2.first_name) AS first_name"), this.db.raw("COALESCE(g.last_name, g2.last_name) AS last_name"), this.db.raw("COALESCE(g.passport_no, g2.passport_no) AS passport_no"), this.db.raw("COALESCE(g.address, g2.address) AS address"), this.db.raw("COALESCE(g.email, g2.email) AS guest_email"), this.db.raw("COALESCE(g.phone, g2.phone) AS phone"), this.db.raw("COALESCE(c.country_name, c2.country_name) AS country"), this.db.raw("COALESCE(c.nationality, c2.nationality) AS nationality"))
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                // .leftJoin("guests AS g", "brg.guest_id", "g.id")
                // .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("booking_room_guest as brg", function () {
                this.on("br.id", "=", "brg.booking_room_id").andOnVal("brg.is_room_primary_guest", "=", true);
            })
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw("Date(br.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("r.id", room_id);
                }
            })
                .orderByRaw("CAST(r.room_name AS INTEGER) ASC");
            const total = yield this.db("booking_rooms AS br")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("br.id as total")
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                // .leftJoin("guests AS g", "brg.guest_id", "g.id")
                // .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("booking_room_guest as brg", function () {
                this.on("br.id", "=", "brg.booking_room_id").andOnVal("brg.is_room_primary_guest", "=", true);
            })
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw("Date(br.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("br.room_id", room_id);
                }
            });
            const [info] = yield this.db("booking_rooms AS br")
                .withSchema(this.RESERVATION_SCHEMA)
                .select(this.db.raw("SUM(br.cbf) AS total_cbf"), this.db.raw("SUM(br.adults) AS total_adults"), this.db.raw("SUM(br.children) AS total_children"), this.db.raw("SUM(br.infant) AS total_infant"), this.db.raw("SUM(br.adults + br.children + br.infant) AS total_person"))
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw("Date(br.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("br.room_id", room_id);
                }
            });
            return {
                data,
                total: Number(((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0),
                total_cbf: Number((info === null || info === void 0 ? void 0 : info.total_cbf) || 0),
                total_adult: Number((info === null || info === void 0 ? void 0 : info.total_adults) || 0),
                total_children: Number((info === null || info === void 0 ? void 0 : info.total_children) || 0),
                total_infant: Number((info === null || info === void 0 ? void 0 : info.total_infant) || 0),
                total_person: Number((info === null || info === void 0 ? void 0 : info.total_person) || 0),
            };
        });
    }
    departureRoomListReport({ hotel_code, current_date, search, limit, room_id, skip, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("booking_rooms AS br");
            if (limit && skip) {
                dtbs.limit(parseInt(limit)).offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("br.id", "b.id as booking_id", "b.booking_reference", this.db.raw(`TO_CHAR(br.check_in, 'YYYY-MM-DD') as check_in`), this.db.raw(`TO_CHAR(br.check_out, 'YYYY-MM-DD') as check_out`), this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.is_individual_booking", "b.status", "b.comments", "b.company_name", "b.visit_purpose", "r.id as room_id", "r.room_name as room_no", "r.floor_no", "br.cbf", "br.adults", "br.children as child_count", "br.infant", this.db.raw("COALESCE(brg.guest_id, b.guest_id) AS guest_id"), this.db.raw("COALESCE(g.first_name, g2.first_name) AS first_name"), this.db.raw("COALESCE(g.last_name, g2.last_name) AS last_name"), this.db.raw("COALESCE(g.passport_no, g2.passport_no) AS passport_no"), this.db.raw("COALESCE(g.address, g2.address) AS address"), this.db.raw("COALESCE(g.email, g2.email) AS guest_email"), this.db.raw("COALESCE(g.phone, g2.phone) AS phone"), this.db.raw("COALESCE(c.country_name, c2.country_name) AS country"), this.db.raw("COALESCE(c.nationality, c2.nationality) AS nationality"), this.db.raw("COALESCE(brg.is_room_primary_guest, false) AS is_room_primary_guest"))
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                // .leftJoin("guests AS g", "brg.guest_id", "g.id")
                // .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("booking_room_guest as brg", function () {
                this.on("br.id", "=", "brg.booking_room_id").andOnVal("brg.is_room_primary_guest", "=", true);
            })
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_out) = ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("r.id", room_id);
                }
            })
                .orderByRaw("CAST(r.room_name AS INTEGER) ASC");
            const total = yield this.db("booking_rooms AS br")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("br.id as total")
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                // .leftJoin("guests AS g", "brg.guest_id", "g.id")
                // .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("booking_room_guest as brg", function () {
                this.on("br.id", "=", "brg.booking_room_id").andOnVal("brg.is_room_primary_guest", "=", true);
            })
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_out) = ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("br.room_id", room_id);
                }
            });
            const [info] = yield this.db("booking_rooms AS br")
                .withSchema(this.RESERVATION_SCHEMA)
                .select(this.db.raw("SUM(br.cbf) AS total_cbf"), this.db.raw("SUM(br.adults) AS total_adults"), this.db.raw("SUM(br.children) AS total_children"), this.db.raw("SUM(br.infant) AS total_infant"), this.db.raw("SUM(br.adults + br.children + br.infant) AS total_person"))
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
                // .leftJoin("guests AS g", "brg.guest_id", "g.id")
                // .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("booking_room_guest as brg", function () {
                this.on("br.id", "=", "brg.booking_room_id").andOnVal("brg.is_room_primary_guest", "=", true);
            })
                .leftJoin("guests AS g", "brg.guest_id", "g.id")
                .leftJoin("guests as g2", "b.guest_id", "g2.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .joinRaw("Left Join public.country as c on g.country_id = c.id")
                .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(br.check_out) = ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("br.status", "checked_in");
                if (search) {
                    qb.andWhere((sub) => {
                        const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                            like,
                        ])
                            .orWhereRaw(`(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("br.room_id", room_id);
                }
            });
            return {
                data,
                total: Number(((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0),
                total_cbf: Number((info === null || info === void 0 ? void 0 : info.total_cbf) || 0),
                total_adult: Number((info === null || info === void 0 ? void 0 : info.total_adults) || 0),
                total_children: Number((info === null || info === void 0 ? void 0 : info.total_children) || 0),
                total_infant: Number((info === null || info === void 0 ? void 0 : info.total_infant) || 0),
                total_person: Number((info === null || info === void 0 ? void 0 : info.total_person) || 0),
            };
        });
    }
    arrivalRoomListReport({ hotel_code, current_date, search, limit, room_id, skip, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("bookings AS b").withSchema(this.RESERVATION_SCHEMA);
            if (limit && skip) {
                dtbs.limit(parseInt(limit)).offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("b.id as booking_id", "b.booking_reference", this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`), "b.booking_type", "b.is_individual_booking", "b.status", "b.check_in", "b.check_out", "b.comments", "b.company_name", "b.visit_purpose", "g.id AS guest_id", "g.first_name", "g.last_name", "g.passport_no", "g.address", "g.email AS guest_email", "g.phone", "c.country_name AS country", "c.nationality", "ua.id as reservation_by_id", "ua.name as reservation_by_name", this.db.raw(`Count(br.id) AS total_reserved_rooms`), this.db.raw(`(SELECT sum(fe.credit) from hotel_reservation.folios as f 
          left join hotel_reservation.folio_entries as fe on f.id = fe.folio_id
          where f.booking_id = b.id and fe.is_void = false) as total_paid_amount
          `), this.db.raw(`
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT('changed_rate', br.changed_rate)
    ) FILTER (WHERE br.changed_rate IS NOT NULL),
    '[]'
  ) as "changed_rates"
`), this.db.raw(`
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'room_id', r.id,
            'room_no', r.room_name
          )
        ) FILTER (WHERE br.id IS NOT NULL),
        '[]'
      ) AS rooms
    `))
                .leftJoin("booking_rooms AS br", "br.booking_id", "b.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .leftJoin("guests AS g", "b.guest_id", "g.id")
                .leftJoin("user_admin AS ua", "b.created_by", "ua.id")
                .joinRaw(" left join public.country AS c  on g.country_id= c.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.booking_type", "B")
                .andWhere("br.status", "confirmed")
                .andWhereRaw("DATE(br.check_in) = ?", [current_date])
                .andWhere((qb) => {
                if (search) {
                    const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                    qb.andWhere((sub) => {
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, '') ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.last_name, '') ILIKE ?", [like])
                            .orWhereRaw(`(COALESCE(g.first_name, '') || ' ' || COALESCE(g.last_name, '')) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, '') ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, '') ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("r.id", room_id);
                }
            })
                .groupBy("b.id", "g.id", "c.country_name", "c.nationality", "ua.id", "ua.name");
            const total = yield this.db("bookings AS b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .leftJoin("booking_rooms AS br", "br.booking_id", "b.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .leftJoin("guests AS g", "b.guest_id", "g.id")
                .leftJoin("user_admin AS ua", "b.created_by", "ua.id")
                .joinRaw(" left join public.country AS c  on g.country_id= c.id")
                .where("b.hotel_code", hotel_code)
                .andWhere("b.booking_type", "B")
                .andWhere("br.status", "confirmed")
                .andWhereRaw("DATE(br.check_in) = ?", [current_date])
                .andWhere((qb) => {
                if (search) {
                    const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
                    qb.andWhere((sub) => {
                        sub
                            .whereRaw("b.company_name ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.first_name, '') ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.last_name, '') ILIKE ?", [like])
                            .orWhereRaw(`(COALESCE(g.first_name, '') || ' ' || COALESCE(g.last_name, '')) ILIKE ?`, [like])
                            .orWhereRaw("COALESCE(g.email, '') ILIKE ?", [like])
                            .orWhereRaw("COALESCE(g.phone, '') ILIKE ?", [like])
                            .orWhereILike("r.room_name", like);
                    });
                }
                if (room_id) {
                    qb.andWhere("r.id", room_id);
                }
            })
                .groupBy("b.id", "g.id", "c.country_name", "c.nationality", "ua.id", "ua.name");
            return {
                data,
                total: Number(((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0),
            };
        });
    }
}
exports.default = ReportModel;
//# sourceMappingURL=ReportModel.js.map