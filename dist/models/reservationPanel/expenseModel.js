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
            return { total: total[0].total, data };
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
            const dataQuery = this.db("expense as e")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("e.id", "e.voucher_no", this.db.raw(`TO_CHAR(e.expense_date, 'YYYY-MM-DD') as expense_date`), "e.name as expense_name", this.db.raw(`(
                    SELECT COALESCE(
                        json_agg(DISTINCT eh.name),
                        '[]'
                    )
                    FROM ?? ei
                    JOIN ?? eh ON eh.id = ei.expense_head_id
                    WHERE ei.expense_id = e.id
                    ) as expense_head_names`, [
                `${this.RESERVATION_SCHEMA}.expense_items`,
                `${this.RESERVATION_SCHEMA}.expense_head`,
            ]), "a.name as account_name", "ua.name as expense_by", "e.total as expense_amount")
                .joinRaw(`JOIN ?? a ON a.id = e.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .join("user_admin as ua", "ua.id", "e.created_by")
                .where("e.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("e.expense_date", [
                        from_date,
                        endDate,
                    ]);
                }
                if (key) {
                    this.andWhere((builder) => {
                        builder
                            .orWhere("e.name", "like", `%${key}%`)
                            .orWhere("a.name", "like", `%${key}%`);
                    });
                }
            })
                .orderBy("e.id", "desc");
            if (limit && skip) {
                dataQuery.limit(parseInt(limit));
                dataQuery.offset(parseInt(skip));
            }
            const data = yield dataQuery;
            const totalResult = yield this.db("expense as e")
                .withSchema(this.RESERVATION_SCHEMA)
                .countDistinct("e.id as total")
                .joinRaw(`JOIN ?? a ON a.id = e.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .where("e.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("e.expense_date", [
                        from_date,
                        endDate,
                    ]);
                }
                if (key) {
                    this.andWhere((builder) => {
                        builder
                            .orWhere("e.name", "like", `%${key}%`)
                            .orWhere("a.name", "like", `%${key}%`);
                    });
                }
            })
                .first();
            return { data, total: (totalResult === null || totalResult === void 0 ? void 0 : totalResult.total) || 0 };
        });
    }
    // get single Expense Model
    getSingleExpense(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("expense as e");
            return yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("e.id", "e.hotel_code", "e.voucher_no", "e.name as expense_name", "e.remarks as expense_details", this.db.raw(`TO_CHAR(e.expense_date, 'YYYY-MM-DD') as expense_date`), "e.total as expense_amount", "a.name as acc_name", "a.acc_type", "a.branch as acc_branch", "a.acc_number", "e.created_at as expense_created_at", this.db.raw(`(
                        SELECT COALESCE(
                        json_agg(
                            json_build_object(
                            'id', ei.id,
                            'item_name', ei.name,
                            'amount', ei.amount,
                            'expense_head_name', eh.name
                            )
                        ), '[]'
                        )
                        FROM ?? ei
                        JOIN ?? eh ON eh.id = ei.expense_head_id
                        WHERE ei.expense_id = e.id
                    ) as expense_items`, [
                `${this.RESERVATION_SCHEMA}.expense_items`,
                `${this.RESERVATION_SCHEMA}.expense_head`,
            ]))
                .leftJoin("hotels as h", "e.hotel_code", "h.hotel_code")
                .joinRaw(`JOIN ?? a ON a.id = e.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .where("e.id", id)
                .andWhere("e.hotel_code", hotel_code);
        });
    }
}
exports.default = ExpenseModel;
//# sourceMappingURL=expenseModel.js.map