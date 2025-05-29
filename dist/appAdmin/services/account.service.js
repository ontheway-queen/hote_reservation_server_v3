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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const doubleEntry_utils_1 = require("../utlis/interfaces/doubleEntry.utils");
const accHeads = {
    CASH: {
        id: 94,
        code: "1001.001",
        group_code: "1000",
    },
    BANK: {
        id: 112,
        code: "1001.002",
        group_code: "1000",
    },
    MOBILE_BANKING: {
        id: 71,
        code: "1000.001.004",
        group_code: "1000",
    },
};
class AccountService extends abstract_service_1.default {
    constructor() {
        super();
    }
    allGroups(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.accountModel().allGroups();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getAllAccHeads(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const data = yield this.Model.accountModel().getAllAccHeads(query);
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    insertAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { group_code, name, parent_id } = req.body;
                const { hotel_code } = req.hotel_admin;
                const model = this.Model.accountModel(trx);
                const payload = [];
                if (parent_id) {
                    const parentHead = yield model.getHeadCodeByHeadId(parent_id);
                    const parentCode = parentHead.code;
                    const isRoot = parentHead.parent_id === null;
                    console.log({ isRoot });
                    const lastChild = yield model.getLastHeadCodeByHeadCode(parent_id, hotel_code, parentHead.group_code);
                    let lastCode = "";
                    if (!lastChild) {
                        lastCode = isRoot ? parentCode : `${parentCode}.000`;
                    }
                    else {
                        lastCode = lastChild.code;
                    }
                    for (const [index, item] of name.entries()) {
                        let nextCode = "";
                        if (isRoot) {
                            // প্রথম লেভেলের child → 1001, 1002 ...
                            nextCode = (parseInt(lastCode, 10) + index + 1).toString();
                        }
                        else {
                            // nested → 1001.001, 1001.002 ...
                            nextCode = model.generateNextGroupCode(lastCode, index);
                        }
                        payload.push({
                            hotel_code,
                            code: nextCode,
                            created_by: req.hotel_admin.id,
                            group_code: parentHead.group_code,
                            name: item,
                            parent_id,
                        });
                    }
                }
                else {
                    // Root head insertion
                    const existingRoot = yield model.getLastRootHeadByGroup(group_code);
                    if (existingRoot) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `Root head already exists for group ${group_code}.`,
                        };
                    }
                    payload.push({
                        hotel_code,
                        code: group_code,
                        created_by: req.hotel_admin.id,
                        group_code,
                        name: name[0],
                        parent_id: undefined,
                    });
                }
                yield model.insertAccHead(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Account head created successfully.",
                };
            }));
        });
    }
    updateAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const id = req.params.id;
            const data = yield this.Model.accountModel().updateAccHead(body, id);
            return { success: true, data };
        });
    }
    deleteAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const data = yield this.Model.accountModel().deleteAccHead(id);
            return { success: true, data };
        });
    }
    allAccVouchers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.accountModel().allAccVouchers();
            return { success: true, data };
        });
    }
    generalJournal(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const vouchers = yield this.Model.accountModel().allAccVouchers();
            const data = (0, doubleEntry_utils_1.journalFormatter)(vouchers);
            return { success: true, data };
        });
    }
    createAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const acc_model = this.Model.accountModel(trx);
                const _a = req.body, { opening_balance, acc_opening_balance_type } = _a, body = __rest(_a, ["opening_balance", "acc_opening_balance_type"]);
                const { group_code, id } = accHeads[body.ac_type];
                const payload = {
                    name: body.name,
                    parent_id: id,
                    code: "",
                    hotel_code: req.hotel_admin.hotel_code,
                    created_by: req.hotel_admin.id,
                    group_code,
                };
                const parentHead = yield acc_model.getHeadCodeByHeadId(id);
                const parentCode = parentHead.code;
                const lastChild = yield acc_model.getLastHeadCodeByHeadCode(id, hotel_code, parentHead.group_code);
                let lastCode = (lastChild === null || lastChild === void 0 ? void 0 : lastChild.code) || `${parentCode}.000`;
                payload.code = acc_model.generateNextGroupCode(lastCode, 0);
                const insertAccHeadRes = yield acc_model.insertAccHead(payload);
                body.acc_head_id = insertAccHeadRes[0].id;
                // insert account
                yield acc_model.createAccount(Object.assign(Object.assign({}, body), { hotel_code }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Account created successfully!",
                };
            }));
        });
    }
    // get all accounts
    getAllAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { ac_type, key, status, limit, skip, admin_id } = req.query;
            const { data, total } = yield this.Model.accountModel().getAllAccounts({
                hotel_code,
                status: status,
                ac_type: ac_type,
                key: key,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // update account
    updateAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const id = parseInt(req.params.id);
            const _a = req.body, { last_balance } = _a, rest = __rest(_a, ["last_balance"]);
            const model = this.Model.accountModel();
            const account = yield model.upadateSingleAccount(Object.assign(Object.assign({}, rest), { hotel_code,
                last_balance }), { hotel_code, id });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Account updated successfully.",
            };
        });
    }
    // balance transfer
    balanceTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotel_code } = req.hotel_admin;
            const { from_account, to_account, transfer_type, pay_amount } = req.body;
            // check account
            // model
            const model = this.Model.accountModel();
            // check from account
            const checkFromAcc = yield model.getSingleAccount({
                hotel_code,
                id: from_account,
            });
            if (!checkFromAcc.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "From account not found",
                };
            }
            // check to account
            const checkToAcc = yield model.getSingleAccount({
                hotel_code,
                id: to_account,
            });
            if (!checkToAcc.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "To account not found",
                };
            }
            const { last_balance: from_acc_last_balance } = checkFromAcc[0];
            const { last_balance: to_acc_last_balance } = checkToAcc[0];
            if (pay_amount > from_acc_last_balance) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Pay amount is more than accounts balance",
                };
            }
            //=========== from account step ==========//
            // get last account ledger
            const lastAL = yield model.getLastAccountLedgerId(hotel_code);
            const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
            const year = new Date().getFullYear();
            // now inset in account ledger
            yield model.insertAccountLedger({
                ac_tr_ac_id: from_account,
                hotel_code,
                transaction_no: `TRX-Balance-Transfer-${year - ledger_id}`,
                ledger_debit_amount: pay_amount,
                ledger_details: `Balance transfer to ${to_account}, total pay amount is = ${pay_amount}`,
            });
            //=========== to account step ==========//
            // now insert in account ledger
            yield model.insertAccountLedger({
                ac_tr_ac_id: to_account,
                hotel_code,
                transaction_no: `TRX-Balance-Transfer-${year - ledger_id}`,
                ledger_credit_amount: pay_amount,
                ledger_details: `Balance transfered from ${from_account}, total paid amount is = ${pay_amount}`,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Balance transfered",
            };
        });
    }
}
exports.AccountService = AccountService;
exports.default = AccountService;
//# sourceMappingURL=account.service.js.map