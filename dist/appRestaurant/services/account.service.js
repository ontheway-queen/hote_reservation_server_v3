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
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class RestaurantAccountService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create Account
    createAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id, id, hotel_code } = req.rest_user;
                const _a = req.body, { opening_balance } = _a, rest = __rest(_a, ["opening_balance"]);
                // model
                const accModel = this.Model.accountModel(trx);
                // insert account
                const res = yield accModel.createAccount(Object.assign(Object.assign({}, rest), { hotel_code, last_balance: opening_balance, res_id, created_by: id }));
                const year = new Date().getFullYear();
                // get last account ledger
                const lastAL = yield accModel.getLastAccountLedgerId(hotel_code);
                const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                // insert in account ledger
                yield accModel.insertAccountLedger({
                    ac_tr_ac_id: res[0],
                    hotel_code,
                    transaction_no: `TRX-RES-ACCOUNT-${year}${ledger_id}`,
                    ledger_credit_amount: opening_balance,
                    ledger_details: `Opening balance has been credited for ${rest.name} account`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Account created successfully.",
                };
            }));
        });
    }
    // get all accounts
    getAllAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res_id, hotel_code } = req.rest_user;
            const { ac_type, key, status, limit, skip } = req.query;
            // model
            const model = this.Model.accountModel();
            // fetch all accounts for the given hotel_code
            const { data, total } = yield model.getAllAccounts({
                res_id,
                status: status,
                ac_type: ac_type,
                key: key,
                limit: limit,
                skip: skip,
                hotel_code,
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
            const { res_id, hotel_code } = req.rest_user;
            const id = parseInt(req.params.id);
            const _a = req.body, { last_balance } = _a, rest = __rest(_a, ["last_balance"]);
            yield this.Model.accountModel().upadateSingleAccount(Object.assign(Object.assign({}, rest), { res_id,
                last_balance }), { res_id, id, hotel_code });
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
            const { id, res_id, hotel_code } = req.rest_user;
            const { from_account, to_account, pay_amount } = req.body;
            // check account
            const accModel = this.Model.accountModel();
            console.log({ res_id, hotel_code, from_account, to_account }, "rest id");
            // check from account
            const checkFromAcc = yield accModel.getSingleAccount({
                hotel_code,
                res_id,
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
            const checkToAcc = yield accModel.getSingleAccount({
                hotel_code,
                res_id,
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
            if (pay_amount > from_acc_last_balance) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Pay amount is more than accounts balance",
                };
            }
            //=========== from account step ==========//
            // get last account ledger
            const lastAL = yield accModel.getLastAccountLedgerId(hotel_code);
            const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
            const year = new Date().getFullYear();
            // now insert in account ledger
            yield accModel.insertAccountLedger({
                ac_tr_ac_id: from_account,
                hotel_code,
                transaction_no: `TRX-BLNC_TRNSFR-RES-${year}${ledger_id}`,
                ledger_debit_amount: pay_amount,
                ledger_details: `Balance transfer to ${to_account}, total pay amount is = ${pay_amount}`,
            });
            // now insert in account ledger
            yield accModel.insertAccountLedger({
                ac_tr_ac_id: to_account,
                hotel_code,
                transaction_no: `TRX-BLNC_TRNSFR-RES-${year}${ledger_id}`,
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
exports.default = RestaurantAccountService;
//# sourceMappingURL=account.service.js.map