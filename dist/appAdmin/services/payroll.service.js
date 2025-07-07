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
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class PayRollService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //=================== Payroll Service ======================//
    createPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const _a = req.body, { deductions, others } = _a, rest = __rest(_a, ["deductions", "others"]);
                const files = req.files || [];
                if (files.length) {
                    rest["docs"] = files[0].filename;
                }
                // Check account
                const accountModel = this.Model.accountModel(trx);
                const checkAccount = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: rest.ac_tr_ac_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const last_balance = checkAccount[0].last_balance;
                if (last_balance < rest.total_salary) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Insufficient balance in this account for pay",
                    };
                }
                const model = this.Model.payRollModel(trx);
                // Get last voucher ID
                const year = new Date().getFullYear();
                const voucherData = yield model.getAllIVoucherForLastId();
                const voucherNo = voucherData.length ? voucherData[0].id + 1 : 1;
                const res = yield model.CreatePayRoll(Object.assign(Object.assign({}, rest), { hotel_code, voucher_no: `PR-${year}${voucherNo}`, ac_tr_ac_id: rest.ac_tr_ac_id, gross_salary: rest.gross_salary, total_salary: rest.total_salary }));
                const payroll_id = res[0].id;
                // Insert payroll deductions
                const deduction_parse = deductions ? JSON.parse(deductions) : [];
                if (deduction_parse.length) {
                    const deductionsPayload = deduction_parse.map((deduction) => {
                        return {
                            payroll_id,
                            deduction_amount: deduction.deduction_amount,
                            deduction_reason: deduction.deduction_reason,
                        };
                    });
                    yield model.createPayRoll_deductions(deductionsPayload);
                }
                // Insert payroll additions
                const addition_parse = others ? JSON.parse(others) : [];
                if (addition_parse.length) {
                    const additionsPayload = addition_parse.map((addition) => {
                        return {
                            payroll_id,
                            hours: addition.hours,
                            other_amount: addition.other_amount,
                            other_details: addition.other_details,
                        };
                    });
                    console.log({ additionsPayload });
                    yield model.createPayRoll_additions(additionsPayload);
                }
                // get last account ledger
                // const lastAL = await accountModel.getLastAccountLedgerId(
                // 	hotel_code
                // );
                // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                // Insert account ledger
                // await accountModel.insertAccountLedger({
                // 	ac_tr_ac_id: rest.ac_tr_ac_id,
                // 	hotel_code,
                // 	transaction_no: `TRX-${year - ledger_id}`,
                // 	ledger_debit_amount: rest.total_salary,
                // 	ledger_details: `Balance Debited by Employee PayRoll as Salary`,
                // });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Payroll created successfully.",
                };
            }));
        });
    }
    // Get all Pay Roll
    getAllPayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const model = this.Model.payRollModel();
            const { data, total } = yield model.getAllPayRoll({
                limit: limit,
                skip: skip,
                key: key,
                from_date: from_date,
                to_date: to_date,
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
    // get Single payRoll
    getSinglePayRoll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.payRollModel().getSinglePayRoll(parseInt(id), hotel_code);
            if (!data) {
                throw new customEror_1.default(`The requested payroll with ID: ${id} not found.`, this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
}
exports.default = PayRollService;
//# sourceMappingURL=payroll.service.js.map