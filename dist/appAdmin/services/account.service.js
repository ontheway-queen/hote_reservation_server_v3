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
const constants_1 = require("../../utils/miscellaneous/constants");
const helperLib_1 = __importDefault(require("../utlis/library/helperLib"));
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
                const { hotel_code, id } = req.hotel_admin;
                const model = this.Model.accountModel(trx);
                for (const head of name) {
                    let newHeadCode = "";
                    if (parent_id) {
                        const parentHead = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            id: parent_id,
                        });
                        if (!parentHead.length) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "Parent head not found!",
                            };
                        }
                        const { code: parent_head_code } = parentHead[0];
                        const heads = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            parent_id,
                            order_by: "ah.code",
                            order_to: "desc",
                        });
                        if (heads.length) {
                            const { code: child_code } = heads[0];
                            const lastHeadCodeNum = child_code.split(".");
                            const newNum = Number(lastHeadCodeNum[lastHeadCodeNum.length - 1]) + 1;
                            newHeadCode = lastHeadCodeNum.pop();
                            newHeadCode = lastHeadCodeNum.join(".");
                            if (newNum < 10) {
                                newHeadCode += ".00" + newNum;
                            }
                            else if (newNum < 100) {
                                newHeadCode += ".0" + newNum;
                            }
                            else {
                                newHeadCode += "." + newNum;
                            }
                        }
                        else {
                            newHeadCode = parent_head_code + ".001";
                        }
                    }
                    else {
                        const checkHead = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            parent_id: null,
                            order_by: "ah.id",
                            order_to: "desc",
                        });
                        if (checkHead.length) {
                            newHeadCode = Number(checkHead[0].code) + 1 + "";
                        }
                        else {
                            newHeadCode = Number(group_code) + 1 + "";
                        }
                    }
                    yield model.insertAccHead({
                        code: newHeadCode,
                        created_by: id,
                        group_code,
                        hotel_code,
                        name: head,
                        parent_id,
                    });
                }
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
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { name, acc_type } = _a, rest = __rest(_a, ["name", "acc_type"]);
                const { id, hotel_code } = req.hotel_admin;
                const accModel = this.Model.accountModel(trx);
                const hotelModel = this.Model.HotelModel(trx);
                const subService = new helperLib_1.default(trx);
                // Get parent head===========================================
                let parent_head = 0;
                if (acc_type === "CASH") {
                    const configData = yield hotelModel.getHotelAccConfig(hotel_code, [
                        constants_1.ACC_HEAD_CONFIG.CASH_HEAD_ID,
                    ]);
                    parent_head = configData[0].head_id;
                }
                else if (acc_type === "BANK") {
                    const configData = yield hotelModel.getHotelAccConfig(hotel_code, [
                        constants_1.ACC_HEAD_CONFIG.BANK_HEAD_ID,
                    ]);
                    parent_head = configData[0].head_id;
                }
                else if (acc_type === "MOBILE_BANKING") {
                    const configData = yield hotelModel.getHotelAccConfig(hotel_code, [
                        constants_1.ACC_HEAD_CONFIG.MFS_HEAD_ID,
                    ]);
                    parent_head = configData[0].head_id;
                }
                console.log({ parent_head });
                const newHeadCode = yield subService.createAccHeadCode({
                    hotel_code,
                    group_code: constants_1.ASSET_GROUP,
                    parent_id: parent_head,
                });
                console.log({ newHeadCode });
                if (!newHeadCode) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                const newHead = yield accModel.insertAccHead({
                    hotel_code,
                    group_code: constants_1.ASSET_GROUP,
                    name,
                    created_by: id,
                    parent_id: parent_head,
                    code: newHeadCode,
                });
                const createAccount = yield accModel.createAccount(Object.assign({ name, acc_head_id: newHead[0].id, acc_type,
                    hotel_code }, rest));
                return {
                    success: true,
                    id: createAccount[0].id,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
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
            // const { last_balance: from_acc_last_balance } = checkFromAcc[0];
            // const { last_balance: to_acc_last_balance } = checkToAcc[0];
            // if (pay_amount > from_acc_last_balance) {
            //   return {
            //     success: false,
            //     code: this.StatusCode.HTTP_BAD_REQUEST,
            //     message: "Pay amount is more than accounts balance",
            //   };
            // }
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