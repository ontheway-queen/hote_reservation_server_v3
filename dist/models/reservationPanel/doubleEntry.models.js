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
const abstract_models_1 = require("../../../abstracts/abstract.models");
const customError_1 = __importDefault(require("../../../common/utils/errors/customError"));
class DoubleEntryModels extends abstract_models_1.AdAbstractModels {
    constructor() {
        super(...arguments);
        // GROUPS
        this.allGroups = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_group').select('code', 'name', 'status', 'description');
        });
        //   ACCOUNT HEAD
        this.allAccHeads = ({ limit, order_by, search, skip, head_id, }) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('acc_head')
                .select('head_id', 'head_group_code', 'head_code', 'head_name', 'head_status', 'head_description')
                .modify((e) => {
                if (search) {
                    e.select(this.db.raw(`
          (
            CASE 
              WHEN head_group_code LIKE ? THEN 3
              WHEN head_code LIKE ? THEN 2
              WHEN head_name LIKE ? THEN 1
              ELSE 0
            END
          ) AS relevance_score
        `, [`%${search}%`, `%${search}%`, `%${search}%`]))
                        .orWhereRaw('head_group_code like ?', [`%${search}%`])
                        .orWhereRaw('head_code like ?', [`%${search}%`])
                        .orWhereRaw('head_name like ?', [`%${search}%`])
                        .orderBy('relevance_score', 'desc');
                }
                else {
                    e.orderBy('head_name', order_by || 'asc');
                }
                if (head_id) {
                    e.where('head_id', head_id);
                }
            })
                .limit(+limit || 20)
                .offset(+skip || 0);
            const { count } = yield this.db('acc_head')
                .count('head_id as count')
                .modify((e) => {
                if (search) {
                    e.orWhereRaw('head_group_code like ?', [`%${search}%`])
                        .orWhereRaw('head_code like ?', [`%${search}%`])
                        .orWhereRaw('head_name like ?', [`%${search}%`]);
                }
                if (head_id) {
                    e.where('head_id', head_id);
                }
            })
                .first();
            return { count, data };
        });
        this.getHeadCodeByGroup = (headGroupCode) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db('acc_head')
                .select('head_code', 'head_id')
                .where('head_group_code', headGroupCode)
                .orderBy('head_id', 'desc')
                .limit(1)
                .first());
        });
        this.getHeadCodeByHeadId = (id) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db('acc_head')
                .select('head_code', 'head_group_code')
                .where('head_id', id)
                .first());
        });
        this.getGroupAndParent = (id) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('acc_head')
                .select('head_code')
                .where('head_parent_id', id)
                .orderBy('head_id', 'desc')
                .limit(1)
                .first();
            return data === null || data === void 0 ? void 0 : data.head_code;
        });
        this.getLastHeadCodeByParent = (id) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db('acc_head')
                .select('head_code')
                .where('head_parent_id', id)
                .orderBy('head_id', 'desc')
                .limit(1)
                .first());
            return data === null || data === void 0 ? void 0 : data.head_code;
        });
        this.getLastHeadCodeByHeadCode = (headCode) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db('acc_head')
                .select('head_code', 'head_id')
                .whereRaw('head_code LIKE ?', [`${headCode}%`])
                .orderBy('head_id', 'desc')
                .limit(1)
                .first());
        });
        this.getLastGroupCode = (groupCode) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db('acc_head')
                .select('head_code', 'head_id', 'head_group_code')
                .where('head_group_code', groupCode)
                .orderBy('head_id', 'desc')
                .limit(1)
                .first());
        });
        this.insertAccHead = (payload) => __awaiter(this, void 0, void 0, function* () {
            const [id] = yield this.db('acc_head').insert(payload);
            return id;
        });
        this.updateAccHead = (payload, id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_head').update(payload).where('head_id', id);
        });
        this.deleteAccHead = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_head').del().where('head_id', id);
        });
        //   ACCOUNT VOUCHERS
        this.allAccVouchers = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('v_acc_vouchers').select('*');
            // .where('org_id', this.org_agency);
        });
        this.insertAccVoucher = (payload) => __awaiter(this, void 0, void 0, function* () {
            const [id] = yield this.db('acc_voucher').insert(payload);
            return id;
        });
        this.updateAccVoucher = (payload, id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_voucher').update(payload).where('id', id);
        });
        this.getHeadByAccount = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.db('trabill_accounts')
                .first('account_head_id')
                .where('account_id', accountId));
            if (!(data === null || data === void 0 ? void 0 : data.account_head_id)) {
                throw new customError_1.default('Please provide valid account', 400, 'Invalid account');
            }
            return data === null || data === void 0 ? void 0 : data.account_head_id;
        });
        this.deleteAccVoucher = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_voucher').del().where('id', id);
        });
        this.deleteAccVouchers = (voucherNo) => __awaiter(this, void 0, void 0, function* () {
            yield this.db('acc_voucher')
                // .where('org_id', this.org_agency)
                .andWhere('voucher_no', 'like', `${voucherNo}%`)
                .del();
        });
    }
    // get account group
    getAccountGroup(code, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_group')
                .select('code', 'name')
                .where((qb) => {
                if (code) {
                    qb.andWhere({ code });
                }
                qb.andWhere({ status });
            });
        });
    }
    // Get account head
    getAccountHead({ company_id, code, group_code, parent_id, 
    // status,
    name, order_by, order_to, id, id_greater, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_head AS ah')
                .select('ah.id', 'ah.code', 'ah.group_code', 'ah.description', 'ah.parent_id', 'ah.name', 'ag.name AS group_name')
                .join('acc_group AS ag', 'ah.group_code', 'ag.code')
                .where((qb) => {
                qb.andWhere('ah.company_id', company_id);
                // qb.andWhere('ah.status', status);
                if (id_greater) {
                    qb.andWhere('ah.id', '>', id_greater);
                }
                if (id) {
                    qb.andWhere('ah.id', id);
                }
                if (code) {
                    qb.andWhere('ah.code', code);
                }
                if (group_code) {
                    qb.andWhere('ah.group_code', group_code);
                }
                if (parent_id) {
                    qb.andWhere('ah.parent_id', parent_id);
                }
                else if (parent_id === null) {
                    qb.whereNull('ah.parent_id');
                }
                if (name) {
                    qb.andWhereILike('ah.name', `%${name}%`);
                }
            })
                .orderBy(order_by ? order_by : 'ah.code', order_to ? order_to : 'asc');
        });
    }
    // Create account head
    createAccountHead(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('acc_head').insert(body, 'id');
        });
    }
}
exports.default = DoubleEntryModels;
//# sourceMappingURL=doubleEntry.models.js.map