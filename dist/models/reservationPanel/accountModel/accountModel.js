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
class AccountModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create account
    createAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("account")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // update account
    upadateSingleAccount(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id, res_id } = where;
            return yield this.db("account")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere(function () {
                this.andWhere({ id });
                if (res_id) {
                    this.andWhere({ res_id });
                }
            });
        });
    }
    // get all account
    getAllAccounts(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, hotel_code, ac_type, key, limit, skip, admin_id, acc_ids, res_id, } = payload;
            const dtbs = this.db("account as a");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("a.id", "a.hotel_code", "a.name", "a.ac_type", "a.bank", "a.branch", "a.account_number", "a.details", "a.status", "a.last_balance as available_balance", "a.created_at")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("a.hotel_code", hotel_code)
                .andWhere(function () {
                if (status) {
                    this.where({ status });
                }
                if (res_id) {
                    this.where({ res_id });
                }
                if (ac_type) {
                    this.andWhere({ ac_type });
                }
                if (admin_id) {
                    this.andWhere({ created_by: admin_id });
                }
                if (acc_ids) {
                    this.whereIn("id", acc_ids);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`)
                        .orWhere("a.account_number", "like", `%${key}%`)
                        .orWhere("a.bank", "like", `%${key}%`);
                }
            })
                .orderBy("a.id", "desc");
            const total = yield this.db("account as a")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("a.id as total")
                .where("a.hotel_code", hotel_code)
                .andWhere(function () {
                if (status) {
                    this.where({ status });
                }
                if (res_id) {
                    this.where({ res_id });
                }
                if (ac_type) {
                    this.andWhere({ ac_type });
                }
                if (admin_id) {
                    this.andWhere({ created_by: admin_id });
                }
                if (acc_ids) {
                    this.whereIn("id", acc_ids);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.andWhere("a.name", "like", `%${key}%`)
                        .orWhere("a.account_number", "like", `%${key}%`)
                        .orWhere("a.bank", "like", `%${key}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single account
    getSingleAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, type, hotel_code, res_id } = payload;
            return yield this.db("account_view")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (id) {
                    this.andWhere({ id });
                }
                if (res_id) {
                    this.andWhere({ res_id });
                }
                if (type) {
                    this.andWhere("ac_type", "like", `%${type}%`);
                }
            });
        });
    }
    // insert in account ledger
    insertAccountLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // get last account ledger
    getLastAccountLedgerId(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_ledger")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ledger_id")
                .where({ hotel_code })
                .orderBy("ledger_id", "desc")
                .limit(1);
        });
    }
    // get ledeger by account id
    getAllLedgerLastBalanceByAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, ledger_account_id } = payload;
            const result = yield this.db.raw(`SELECT ${this.RESERVATION_SCHEMA}.get_ledger_balance(?, ?) AS remaining_balance`, [hotel_code, ledger_account_id]);
            const remainingBalance = result[0][0].remaining_balance;
            return remainingBalance;
        });
    }
}
exports.default = AccountModel;
//# sourceMappingURL=accountModel.js.map