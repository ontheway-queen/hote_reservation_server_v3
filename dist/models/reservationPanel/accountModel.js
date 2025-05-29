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
class AccountModel extends schema_1.default {
    constructor(db) {
        super();
        this.getLastGroupCode = (groupCode) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db("acc_head")
                .select("head_code", "head_id", "head_group_code")
                .where("head_group_code", groupCode)
                .orderBy("head_id", "desc")
                .limit(1)
                .first());
        });
        this.db = db;
    }
    allGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_groups")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("code", "name", "description");
        });
    }
    generateNextGroupCode(lastCode, index = 0) {
        const parts = lastCode.split(".");
        const lastSegment = parts.pop();
        const base = parts.join(".");
        const nextNumber = parseInt(lastSegment || "0", 10) + 1 + index;
        const padded = nextNumber.toString().padStart(3, "0");
        return `${base}.${padded}`;
    }
    insertAccHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateAccHead(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("head_id", id);
        });
    }
    deleteAccHead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_head")
                .withSchema(this.RESERVATION_SCHEMA)
                // .del()
                .where("head_id", id);
        });
    }
    getAllAccHeads({ limit, order_by, search, skip, head_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "group_code", "code", "name", "is_active")
                .modify((e) => {
                if (search) {
                    e.select(this.db.raw(`
          (
            CASE 
              WHEN rgoup_code LIKE ? THEN 3
              WHEN code LIKE ? THEN 2
              WHEN name LIKE ? THEN 1
              ELSE 0
            END
          ) AS relevance_score
        `, [`%${search}%`, `%${search}%`, `%${search}%`]))
                        .orWhereRaw("group_code like ?", [`%${search}%`])
                        .orWhereRaw("code like ?", [`%${search}%`])
                        .orWhereRaw("name like ?", [`%${search}%`])
                        .orderBy("relevance_score", "desc");
                }
                else {
                    e.orderBy("name", order_by || "asc");
                }
                if (head_id) {
                    e.where("id", head_id);
                }
            })
                .limit(limit || 20)
                .offset(skip || 0);
            const { total } = yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .modify((e) => {
                if (search) {
                    e.orWhereRaw("group_code like ?", [`%${search}%`])
                        .orWhereRaw("code like ?", [`%${search}%`])
                        .orWhereRaw("name like ?", [`%${search}%`]);
                }
                if (head_id) {
                    e.where("id", head_id);
                }
            })
                .first();
            return { total, data };
        });
    }
    getLastRootHeadByGroup(group_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("group_code", group_code)
                .whereNull("parent_id")
                .orderByRaw("string_to_array(code, '.')::int[] DESC")
                .first();
        });
    }
    getLastHeadCodeByHeadCode(parent_id, hotel_code, group_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("hotel_code", hotel_code)
                .andWhere("group_code", group_code)
                .andWhere("parent_id", parent_id)
                .orderByRaw("string_to_array(code, '.')::int[] DESC")
                .first();
        });
    }
    getHeadCodeByHeadId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("code", "group_code", "parent_id")
                .where("id", id)
                .first();
        });
    }
    getGroupAndParent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("code")
                .where("parent_id", id)
                .orderBy("id", "desc")
                .limit(1)
                .first();
            return data === null || data === void 0 ? void 0 : data.code;
        });
    }
    getLastHeadCodeByParent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db("acc_heads")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("code")
                .where("parent_id", id)
                .orderBy("id", "desc")
                .limit(1)
                .first());
            return data === null || data === void 0 ? void 0 : data.head_code;
        });
    }
    allAccVouchers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("v_acc_vouchers")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*");
            // .where('org_id', this.org_agency);
        });
    }
    getVoucherCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.db("acc_vouchers")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total");
            return total.length ? total[0].total : 0;
        });
    }
    insertAccVoucher(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_vouchers")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateAccVoucher(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_voucher").update(payload).where("id", id);
        });
    }
    getHeadByAccount(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db("trabill_accounts")
                .first("account_head_id")
                .where("account_id", accountId));
            return data === null || data === void 0 ? void 0 : data.account_head_id;
        });
    }
    deleteAccVoucher(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_voucher").del().where("id", id);
        });
    }
    deleteAccVouchers(voucherNo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("acc_voucher")
                // .where('org_id', this.org_agency)
                .andWhere("voucher_no", "like", `${voucherNo}%`)
                .del();
        });
    }
    // get account group
    getAccountGroup(code, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_group")
                .select("code", "name")
                .where((qb) => {
                if (code) {
                    qb.andWhere({ code });
                }
                qb.andWhere({ status });
            });
        });
    }
    // Get account head
    getAccountHead({ hotel_code, code, group_code, parent_id, name, order_by, order_to, id, id_greater, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_head AS ah")
                .select("ah.id", "ah.code", "ah.group_code", "ah.description", "ah.parent_id", "ah.name", "ag.name AS group_name")
                .join("acc_group AS ag", "ah.group_code", "ag.code")
                .where((qb) => {
                qb.andWhere("ah.company_id", hotel_code);
                // qb.andWhere('ah.status', status);
                if (id_greater) {
                    qb.andWhere("ah.id", ">", id_greater);
                }
                if (id) {
                    qb.andWhere("ah.id", id);
                }
                if (code) {
                    qb.andWhere("ah.code", code);
                }
                if (group_code) {
                    qb.andWhere("ah.group_code", group_code);
                }
                if (parent_id) {
                    qb.andWhere("ah.parent_id", parent_id);
                }
                else if (parent_id === null) {
                    qb.whereNull("ah.parent_id");
                }
                if (name) {
                    qb.andWhereILike("ah.name", `%${name}%`);
                }
            })
                .orderBy(order_by ? order_by : "ah.code", order_to ? order_to : "asc");
        });
    }
    createAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accounts")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
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
            const { status, hotel_code, ac_type, key, limit, skip, acc_ids } = payload;
            const dtbs = this.db("accounts");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("id", "hotel_code", "name", "ac_type", "branch", "acc_number", "details", "is_active")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (status) {
                    this.where("is_active", status);
                }
                if (ac_type) {
                    this.andWhere("ac_type", ac_type.toUpperCase());
                }
                if (acc_ids) {
                    this.whereIn("id", acc_ids);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.andWhere("name", "like", `%${key}%`).orWhere("acc_number", "like", `%${key}%`);
                }
            })
                .orderBy("id", "desc");
            const total = yield this.db("accounts")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (status) {
                    this.where("is_active", status);
                }
                if (ac_type) {
                    this.andWhere("ac_type", ac_type.toUpperCase());
                }
                if (acc_ids) {
                    this.whereIn("id", acc_ids);
                }
            })
                .andWhere(function () {
                if (key) {
                    this.andWhere("name", "like", `%${key}%`).orWhere("acc_number", "like", `%${key}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single account
    getSingleAccount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, type, hotel_code } = payload;
            return yield this.db("accounts")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "acc_head_id", "ac_type", "name", "branch", "acc_number", "is_active", "acc_routing_no", "details")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (id) {
                    this.andWhere({ id });
                }
                if (type) {
                    this.andWhere("ac_type", type);
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