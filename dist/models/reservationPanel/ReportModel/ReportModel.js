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
}
exports.default = ReportModel;
//# sourceMappingURL=ReportModel.js.map