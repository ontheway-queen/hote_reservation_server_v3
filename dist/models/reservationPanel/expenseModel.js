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
class ExpenseModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create Expense Head Model
    createExpenseHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Expense Head Model
    getAllExpenseHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name } = payload;
            const dtbs = this.db("expense_head as eh");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("eh.id", "eh.name", "ua.id as created_by_id", "ua.name as created_by_name", "eh.is_deleted")
                .leftJoin("user_admin as ua", "ua.id", "eh.created_by")
                .where("eh.hotel_code", hotel_code)
                .andWhere("eh.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("eh.name", "like", `%${name}%`);
                }
            })
                .orderBy("eh.id", "desc");
            const total = yield this.db("expense_head as eh")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("eh.id as total")
                .where("eh.hotel_code", hotel_code)
                .andWhere("eh.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("eh.name", "like", `%${name}%`);
                }
            });
            return { total: Number(total[0].total) || 0, data };
        });
    }
    // Update Expense Head Model
    updateExpenseHead(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update(payload);
        });
    }
    // Delete Expense Head Model
    deleteExpenseHead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update({ is_deleted: true });
        });
    }
    // Create Expense Model
    createExpense(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    // create expense item
    createExpenseItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get all voucher last id
    getAllIVoucherForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("expense")
                .select("id")
                .withSchema(this.RESERVATION_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // get All Expense Model
    getAllExpense(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, from_date, to_date, key } = payload;
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("expense as ev").withSchema(this.RESERVATION_SCHEMA);
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("ev.id", "ev.voucher_no", "ev.ac_tr_ac_id as account_id", this.db.raw(`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date`), "ev.name as expense_name", "acc.name as account_name", "acc.acc_type as account_type", "ev.total as expense_amount", "ev.created_at", this.db.raw(`
			COALESCE(
				json_agg(
					json_build_object(
						'id', ei.id,
						'item_name', ei.name,
						'amount', ei.amount
					)
				) FILTER (WHERE ei.id IS NOT NULL), '[]'
			) as expense_items
		`))
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .where("ev.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("ev.expense_date", [
                        from_date,
                        endDate,
                    ]);
                }
                if (key) {
                    this.andWhere((builder) => {
                        builder
                            .orWhere("ev.name", "like", `%${key}%`)
                            .orWhere("acc.name", "like", `%${key}%`);
                    });
                }
            })
                .groupBy("ev.id", "ev.voucher_no", "ev.ac_tr_ac_id", "ev.expense_date", "ev.name", "acc.name", "acc.acc_type", "ev.total", "ev.created_at")
                .orderBy("ev.id", "desc");
            const total = yield this.db("expense as ev")
                .withSchema(this.RESERVATION_SCHEMA)
                .countDistinct("ev.id as total")
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .where("ev.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("ev.expense_date", [
                        from_date,
                        endDate,
                    ]);
                }
                if (key) {
                    this.andWhere((builder) => {
                        builder
                            .orWhere("ev.name", "like", `%${key}%`)
                            .orWhere("a.name", "like", `%${key}%`);
                    });
                }
            })
                .first();
            return { data, total: total ? Number(total.total) : 0 };
        });
    }
    // get single Expense Model
    getSingleExpense(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("expense as ev");
            return yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ev.id", "ev.hotel_code", "ev.voucher_no", "h.name as hotel_name", "h.address as hotel_address", "ev.name as expense_name", "acc.name as account_name", "acc.acc_number as account_number", "acc.acc_type as account_type", this.db.raw(`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date`), this.db.raw(`to_char(ev.created_at, 'YYYY-MM-DD') as expense_created_at`), "acc.name as bank_name", "acc.branch", "ev.total as total_cost", "ev.remarks as expense_details", this.db.raw(`
			COALESCE(
				json_agg(
					json_build_object(
						'id', ei.id,
						'item_name', ei.name,
						'amount', ei.amount
					)
				) FILTER (WHERE ei.id IS NOT NULL), '[]'
			) as expense_items
		`))
                .leftJoin("hotels as h", "ev.hotel_code", "h.hotel_code")
                .joinRaw(`JOIN ?? AS acc ON acc.id = ev.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
                .where("ev.id", id)
                .andWhere("ev.hotel_code", hotel_code)
                .groupBy("ev.id", "ev.voucher_no", "ev.ac_tr_ac_id", "ev.expense_date", "ev.name", "acc.name", "acc.acc_type", "ev.total", "ev.created_at", "h.name", "h.address", "acc.acc_number", "acc.branch");
        });
    }
}
exports.default = ExpenseModel;
//# sourceMappingURL=expenseModel.js.map