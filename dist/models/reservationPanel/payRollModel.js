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
class PayRollModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create PayRoll
    CreatePayRoll(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    // Create pay roll deductions
    createPayRoll_deductions(insertObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("payroll_deductions")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(insertObj);
            return res;
        });
    }
    // Create pay roll additions
    createPayRoll_additions(insertObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("payroll_additions")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(insertObj);
            return res;
        });
    }
    // Get All Pay Roll
    getAllPayRoll(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, limit, skip, from_date, to_date } = payload;
            const dtbs = this.db("payroll as p");
            const endDatePlusOneDay = new Date(to_date);
            endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("p.id", "p.voucher_no", "e.name as employee_name", "de.name as designation", "a.ac_type as pay_method", "a.name as account_name", "e.salary as base_salary", "p.attendance_days", "p.working_hours", "p.gross_salary", "p.total_salary", "p.salary_date")
                .leftJoin("employee as e", "e.id", "p.employee_id")
                .leftJoin("designation as de", "de.id", "e.designation_id")
                .joinRaw(`JOIN ?? as a ON a.id = p.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .where("p.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("p.salary_date", [from_date, to_date]);
                }
                if (key) {
                    this.andWhere("e.name", "like", `%${key}%`)
                        .orWhere("de.name", "like", `%${key}%`)
                        .orWhere("p.voucher_no", "like", `%${key}%`)
                        .orWhere("a.name", "like", `%${key}%`);
                }
            })
                .orderBy("p.id", "desc");
            const total = yield this.db("payroll as p")
                .count("p.id as total")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("employee as e", "e.id", "p.employee_id")
                .leftJoin("designation as de", "de.id", "e.designation_id")
                .joinRaw(`JOIN ?? as a ON a.id = p.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .where("p.hotel_code", hotel_code)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("p.salary_date", [from_date, to_date]);
                }
                if (key) {
                    this.andWhere("e.name", "like", `%${key}%`)
                        .orWhere("de.name", "like", `%${key}%`)
                        .orWhere("p.voucher_no", "like", `%${key}%`)
                        .orWhere("a.name", "like", `%${key}%`);
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    // get all voucher last id
    getAllIVoucherForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll")
                .select("id")
                .withSchema(this.RESERVATION_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // get single pay Roll
    getSinglePayRoll(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const payroll = yield this.db("payroll as p")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("p.id", "p.voucher_no", "acc.ac_type", "acc.name as account_name", "acc.branch as branch_name", "h.name as hotel_name", "h.address as hotel_address", "h.country_code", "h.city_code", "h.postal_code", "e.name as employee_name", "des.name as employee_designation", "e.mobile_no as employee_phone", "p.attendance_days", "p.working_hours", "p.advance_salary", "p.gross_salary", "p.provident_fund", "p.mobile_bill", "p.feed_allowance", "p.perform_bonus", "p.festival_bonus", "p.travel_allowance", "p.health_allowance", "p.incentive", "p.salary_date", "p.house_rent", "p.total_salary")
                .join("hotels as h", "h.hotel_code", "p.hotel_code")
                .joinRaw(`JOIN ?? as acc ON acc.id = p.ac_tr_ac_id`, [
                `${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
            ])
                .join("employee as e", "e.id", "p.employee_id")
                .join("designation as des", "des.id", "e.designation_id")
                .where("p.id", id)
                .andWhere("p.hotel_code", hotel_code)
                .first();
            if (!payroll) {
                return null;
            }
            const deductions = yield this.db("payroll_deductions")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "deduction_amount", "deduction_reason")
                .where("payroll_id", id);
            const additions = yield this.db("payroll_additions")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "other_amount", "other_details")
                .where("payroll_id", id);
            return Object.assign(Object.assign({}, payroll), { deductions,
                additions });
        });
    }
}
exports.default = PayRollModel;
//# sourceMappingURL=payRollModel.js.map