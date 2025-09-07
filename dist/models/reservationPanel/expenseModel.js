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
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ExpenseModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getExpenseHeads({ search, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = this.db("acc_heads")
                .select("id as head_id", "name", "code")
                .withSchema(this.ACC_SCHEMA)
                .where("group_code", constants_1.EXPENSE_GROUP)
                .andWhere((builder) => {
                builder.whereNull("hotel_code").orWhere("hotel_code", hotel_code);
            })
                .modify((e) => {
                if (search)
                    e.whereRaw("name LIKE ?", [`%${search}%`]);
            });
            return results;
        });
    }
    createExpense(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense")
                .withSchema(this.ACC_SCHEMA)
                .insert(payload, "id");
        });
    }
    createExpenseItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense_items")
                .withSchema(this.ACC_SCHEMA)
                .insert(payload);
        });
    }
    getExpenseLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense")
                .select("id")
                .withSchema(this.ACC_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    getAllExpense(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, from_date, to_date, key } = payload;
            const endDate = to_date ? new Date(to_date) : undefined;
            if (endDate)
                endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("expense as ev").withSchema(this.ACC_SCHEMA);
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("ev.id", "ev.hotel_code", "ev.voucher_no", "ev.expense_date", "ev.expense_by as expense_by_id", "emp.name as expense_by_name", "ev.pay_method", "ev.transaction_no", "ev.expense_cheque_id", "ev.bank_name", "ev.branch_name", "ev.cheque_no", "ev.cheque_date", "ev.deposit_date", this.db.raw(`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date_formatted`), 
            // "ev.name as expense_name",
            "acc_head.name as account_name", "acc.acc_type as account_type", "ev.expense_amount", "ev.created_at", this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ei.id,
              'head_name', eh.name,
              'remarks', ei.remarks,
              'amount', ei.amount
            )
          ) FILTER (WHERE ei.id IS NOT NULL), '[]'
        ) as expense_items
      `))
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
            ])
                .joinRaw(`JOIN ?? AS emp ON emp.id = ev.expense_by`, [
                `${this.HR_SCHEMA}.${this.TABLES.employee}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .leftJoin("acc_heads as eh", "ei.expense_head_id", "eh.id")
                .where("ev.hotel_code", hotel_code)
                .modify((builder) => {
                if (from_date && endDate) {
                    builder.andWhereBetween("ev.expense_date", [from_date, endDate]);
                }
                if (key) {
                    builder.andWhere((q) => {
                        q.orWhere("eh.name", "like", `%${key}%`)
                            .orWhere("acc.name", "like", `%${key}%`)
                            .orWhere("ev.voucher_no", "like", `%${key}%`);
                    });
                }
            })
                .groupBy("ev.id", "emp.name", "acc.name", "acc.acc_type", "acc_head.name")
                .orderBy("ev.id", "desc");
            const total = yield this.db("expense as ev")
                .withSchema(this.ACC_SCHEMA)
                .countDistinct("ev.id as total")
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .leftJoin("acc_heads as eh", "ei.expense_head_id", "eh.id")
                .where("ev.hotel_code", hotel_code)
                .modify((builder) => {
                if (from_date && endDate) {
                    builder.andWhereBetween("ev.expense_date", [from_date, endDate]);
                }
                if (key) {
                    builder.andWhere((q) => {
                        q.orWhere("eh.name", "like", `%${key}%`)
                            .orWhere("acc.name", "like", `%${key}%`)
                            .orWhere("ev.voucher_no", "like", `%${key}%`);
                    });
                }
            })
                .first();
            return { data, total: total ? Number(total.total) : 0 };
        });
    }
    getSingleExpense(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("expense as ev").withSchema(this.ACC_SCHEMA);
            const data = yield dtbs
                .select("ev.id", "ev.hotel_code", "ev.voucher_no", "h.name as hotel_name", "h.address as hotel_address", "acc_head.name as account_name", "acc.acc_type as account_type", "ev.pay_method", this.db.raw(`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date`), this.db.raw(`to_char(ev.created_at, 'YYYY-MM-DD') as expense_created_at`), "ev.transaction_no", "ev.cheque_no", "ev.cheque_date", "ev.bank_name", "ev.branch_name", "ev.expense_amount", "ev.expense_note", this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ah.id,
              'head_name', ah.name,
              'remarks', ei.remarks,
              'amount', ei.amount
            )
          ) FILTER (WHERE ei.id IS NOT NULL), '[]'
        ) as expense_items
      `))
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .joinRaw(`LEFT JOIN ${this.ACC_SCHEMA}.acc_heads as ah ON ei.expense_head_id = ah.id`)
                .joinRaw(`LEFT JOIN ${this.RESERVATION_SCHEMA}.hotels as h ON ev.hotel_code = h.hotel_code`)
                .where("ev.id", id)
                .andWhere("ev.hotel_code", hotel_code)
                .groupBy("ev.id", "ev.voucher_no", "ev.account_id", "ev.expense_date", "acc.name", "acc.acc_type", "ev.created_at", "h.name", "h.address", "ev.pay_method", "ev.transaction_no", "ev.cheque_no", "ev.cheque_date", "ev.bank_name", "ev.branch_name", "acc_head.name");
            return data;
        });
    }
}
exports.default = ExpenseModel;
//# sourceMappingURL=expenseModel.js.map