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
                .withSchema(this.ACC_SCHEMA)
                .select("code", "name", "description");
        });
    }
    insertAccHead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateAccHead(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .update(payload)
                .where("head_id", id);
        });
    }
    deleteAccHeadConfig({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_head_config")
                .withSchema(this.ACC_SCHEMA)
                .update({ is_deleted: true })
                .where(function () {
                if (id) {
                    this.where("id", id);
                }
                if (hotel_code) {
                    this.andWhere("hotel_code", hotel_code);
                }
            });
        });
    }
    deleteAccHeads({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .update({ is_deleted: true })
                .where(function () {
                if (id) {
                    this.where("head_id", id);
                }
                if (hotel_code) {
                    this.andWhere("hotel_code", hotel_code);
                }
            });
        });
    }
    deleteAccHead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .del()
                .where("id", id);
        });
    }
    getAccHeadsForSelect(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads AS ah")
                .withSchema(this.ACC_SCHEMA)
                .select("ah.id AS head_id", "ah.parent_id AS head_parent_id", "ah.code AS head_code", "ah.group_code AS head_group_code", "ah.name AS head_name", "aph.code AS parent_head_code", "aph.name AS parent_head_name")
                .leftJoin("acc_heads AS aph", { "aph.id": "ah.parent_id" })
                .where("ah.is_deleted", false)
                .andWhere("ah.hotel_code", hotel_code)
                .andWhere("ah.is_active", 1)
                .orderBy("ah.id", "asc");
        });
    }
    getAllAccHeads({ limit, order_by, search, skip, head_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .select("id", "group_code", "code", "name", "is_active")
                .modify((qb) => {
                qb.andWhere("is_deleted", false);
                if (search) {
                    qb.select(this.db.raw(`
          (
            CASE 
              WHEN group_code LIKE ? THEN 3
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
                    qb.orderBy("name", order_by || "asc");
                }
                if (head_id) {
                    qb.where("id", head_id);
                }
            })
                .limit(limit || 20)
                .offset(skip || 0);
            const { total } = yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .count("id as total")
                .modify((qb) => {
                if (search) {
                    qb.orWhereRaw("group_code like ?", [`%${search}%`])
                        .orWhereRaw("code like ?", [`%${search}%`])
                        .orWhereRaw("name like ?", [`%${search}%`]);
                }
                if (head_id) {
                    qb.where("id", head_id);
                }
            })
                .first();
            return { total, data };
        });
    }
    getAccHeadByCode(hotel_code, group_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .select("*")
                .withSchema(this.ACC_SCHEMA)
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere("group_code", group_code)
                .first();
        });
    }
    getHeadCodeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
                .select("*")
                .where("id", id)
                .andWhere("is_deleted", false)
                .first();
        });
    }
    getLastHeadCodeByParent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db("acc_heads")
                .withSchema(this.ACC_SCHEMA)
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
                .withSchema(this.ACC_SCHEMA)
                .select("*");
            // .where('org_id', this.org_agency);
        });
    }
    getVoucherCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.db("acc_vouchers")
                .withSchema(this.ACC_SCHEMA)
                .count("id as total");
            return total.length ? total[0].total : 0;
        });
    }
    insertAccVoucher(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_vouchers")
                .withSchema(this.ACC_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateAccVoucher(payload, { hotel_code, id }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_voucher")
                .update(payload)
                .andWhere("id", id)
                .andWhere("hotel_code", hotel_code);
        });
    }
    deleteAccVoucherById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_voucher").del().where("id", id);
        });
    }
    deleteAccVoucherByVoucherNo(voucherNo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("acc_voucher").where("voucher_no", voucherNo).del();
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
            return yield this.db("acc_heads AS ah")
                .select("ah.id", "ah.code", "ah.group_code", "ah.parent_id", "ah.name", "ag.name AS group_name")
                .withSchema(this.ACC_SCHEMA)
                .join("acc_groups AS ag", "ah.group_code", "ag.code")
                .where((qb) => {
                qb.andWhere("ah.hotel_code", hotel_code);
                qb.andWhere("ah.is_deleted", false);
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
                .withSchema(this.ACC_SCHEMA)
                .insert(payload, "id");
        });
    }
    checkAccName(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("accounts")
                .withSchema(this.ACC_SCHEMA)
                .andWhere("hotel_code", payload.hotel_code)
                .andWhere("name", payload.name);
        });
    }
    // update account
    upadateSingleAccount(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, id, res_id } = where;
            return yield this.db("account")
                .withSchema(this.ACC_SCHEMA)
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
                .select("id", "hotel_code", "name", "acc_type", "branch", "acc_number", "details", "is_active")
                .withSchema(this.ACC_SCHEMA)
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere(function () {
                if (status) {
                    this.where("is_active", status);
                }
                if (ac_type) {
                    this.andWhereRaw("LOWER(acc_type) = ?", [
                        ac_type.toLowerCase(),
                    ]);
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
                .withSchema(this.ACC_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere(function () {
                if (status) {
                    this.where("is_active", status);
                }
                if (ac_type) {
                    this.andWhereRaw("LOWER(acc_type) = ?", [
                        ac_type.toLowerCase(),
                    ]);
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
                .withSchema(this.ACC_SCHEMA)
                .select("id", "acc_head_id", "acc_type", "name", "branch", "acc_number", "is_active", "acc_routing_no", "details")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
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
                .withSchema(this.ACC_SCHEMA)
                .insert(payload);
        });
    }
    // get last account ledger
    getLastAccountLedgerId(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("acc_ledger")
                .withSchema(this.ACC_SCHEMA)
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
            const result = yield this.db.raw(`SELECT ${this.ACC_SCHEMA}.get_ledger_balance(?, ?) AS remaining_balance`, [hotel_code, ledger_account_id]);
            const remainingBalance = result[0][0].remaining_balance;
            return remainingBalance;
        });
    }
}
exports.default = AccountModel;
//# sourceMappingURL=accountModel.js.map