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
                .select("av.id", "av.acc_head_id", "av.voucher_no", "av.voucher_date", "av.voucher_type", "av.description", "av.debit", "av.credit", "ah.code AS acc_head_code", "ah.name AS acc_head_name", "ah.parent_id", "aph.name AS parent_acc_head_name", "ua.name AS created_by", "av.created_at")
                .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS ah`, "av.acc_head_id", "ah.id")
                .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS aph`, {
                "aph.id": "ah.parent_id",
            })
                .leftJoin(`${this.RESERVATION_SCHEMA}.user_admin AS ua`, "av.created_by", "ua.id")
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
    inhouseGuestListReport({ hotel_code, current_date, search, limit, room_id, skip, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("booking_rooms AS br");
            if (limit && skip) {
                dtbs.limit(parseInt(limit)).offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("br.id", "b.id as booking_id", "b.check_in", "b.check_out", "b.booking_type", "b.is_individual_booking", "b.status", "b.comments", "b.company_name", "b.visit_purpose", "r.room_name as room_no", "r.floor_no", "b.check_in", "b.check_out", "b.booking_date", "br.cbf", "br.adults", "br.children as child_count", "br.infant", "b.guest_id", "g.first_name", "g.last_name", "g.country", "g.nationality", "g.address", "g.email AS guest_email", "g.phone AS guest_phone")
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                .leftJoin("guests AS g", "b.guest_id", "g.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(b.check_in) <= ?", [current_date]).andWhereRaw("Date(b.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("b.status", "checked_in");
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where("g.first_name", "like", `%${search}%`)
                            .orWhere("g.last_name", "like", `%${search}%`)
                            .orWhere("g.email", "like", `%${search}%`)
                            .orWhere("g.phone", "like", `%${search}%`)
                            .orWhere("r.room_name", "like", `%${search}%`);
                    });
                }
                if (room_id) {
                    qb.andWhere("br.room_id", room_id);
                }
            });
            const total = yield this.db("booking_rooms AS br")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("br.id as total")
                .leftJoin("bookings AS b", "br.booking_id", "b.id")
                .leftJoin("guests AS g", "b.guest_id", "g.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(b.check_in) <= ?", [current_date]).andWhereRaw("Date(b.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("b.status", "checked_in");
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where("g.first_name", "like", `%${search}%`)
                            .orWhere("g.last_name", "like", `%${search}%`)
                            .orWhere("g.email", "like", `%${search}%`)
                            .orWhere("g.phone", "like", `%${search}%`)
                            .orWhere("r.room_name", "like", `%${search}%`);
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
                .leftJoin("guests AS g", "b.guest_id", "g.id")
                .leftJoin("rooms AS r", "br.room_id", "r.id")
                .where("b.hotel_code", hotel_code)
                .andWhere((qb) => {
                qb.whereRaw("Date(b.check_in) <= ?", [current_date]).andWhereRaw("Date(b.check_out) >= ?", [current_date]);
                qb.andWhere("b.booking_type", "B");
                qb.andWhere("b.status", "checked_in");
                if (search) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where("g.first_name", "like", `%${search}%`)
                            .orWhere("g.last_name", "like", `%${search}%`)
                            .orWhere("g.email", "like", `%${search}%`)
                            .orWhere("g.phone", "like", `%${search}%`)
                            .orWhere("r.room_name", "like", `%${search}%`);
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
}
exports.default = ReportModel;
//# sourceMappingURL=ReportModel.js.map