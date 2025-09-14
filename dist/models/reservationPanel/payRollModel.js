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
    // Check payroll
    hasPayrollForMonth({ employee_id, hotel_code, salary_date, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db("payroll as p")
                .withSchema(this.HR_SCHEMA)
                .count("p.id as total")
                .where("p.employee_id", employee_id)
                .andWhere("p.hotel_code", hotel_code)
                .andWhere("p.is_deleted", false)
                .andWhereRaw("TO_CHAR(p.salary_date, 'YYYY-MM') = TO_CHAR(?::date, 'YYYY-MM')", [salary_date]);
            return Number(result[0].total) > 0;
        });
    }
    // Create PayRoll
    CreatePayRoll(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ a: payload.account_id });
            return yield this.db("payroll")
                .withSchema(this.HR_SCHEMA)
                .insert(payload, "id");
        });
    }
    // Create employee deductions
    createEmployeeDeductions(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_deductions")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
        });
    }
    // Create employee allowance
    createEmployeeAllowances(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_allowances")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
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
                .withSchema(this.HR_SCHEMA)
                .select("p.id", "e.name as employee_name", "de.name as designation", "p.total_allowance", this.db.raw(`(SELECT SUM(p2.total_deduction + p2.unpaid_leave_deduction)
     FROM ${this.HR_SCHEMA}.payroll p2
     WHERE p2.employee_id = p.employee_id
       AND p2.hotel_code = p.hotel_code) as total_deduction`), "p.basic_salary", "p.gross_salary", "p.net_salary", "p.salary_date")
                .leftJoin("employee as e", "e.id", "p.employee_id")
                .leftJoin("designation as de", "de.id", "e.designation_id")
                .where("p.hotel_code", hotel_code)
                .andWhere("p.is_deleted", false)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("p.salary_date", [from_date, to_date]);
                }
                if (key) {
                    this.andWhere("e.name", "like", `%${key}%`)
                        .orWhere("de.name", "like", `%${key}%`)
                        .orWhere("a.name", "like", `%${key}%`);
                }
            })
                .orderBy("p.id", "desc");
            const total = yield this.db("payroll as p")
                .count("p.id as total")
                .withSchema(this.HR_SCHEMA)
                .leftJoin("employee as e", "e.id", "p.employee_id")
                .leftJoin("designation as de", "de.id", "e.designation_id")
                .where("p.hotel_code", hotel_code)
                .andWhere("p.is_deleted", false)
                .andWhere(function () {
                if (from_date && to_date) {
                    this.andWhereBetween("p.salary_date", [from_date, to_date]);
                }
                if (key) {
                    this.andWhere("e.name", "like", `%${key}%`)
                        .orWhere("de.name", "like", `%${key}%`)
                        .orWhere("a.name", "like", `%${key}%`);
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    // get single pay Roll
    getSinglePayRoll(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll as p")
                .withSchema(this.HR_SCHEMA)
                .select("p.id", "h.name as hotel_name", "h.address as hotel_address", "h.country_code", "h.city_code", "h.postal_code", "e.id as employee_id", "e.name as employee_name", "des.name as employee_designation", "e.contact_no as employee_phone", "p.total_allowance", "p.total_deduction", "p.unpaid_leave_days", "p.leave_days", "p.salary_basis", "p.unpaid_leave_deduction", "p.payable_days", "p.daily_rate", "p.basic_salary", "p.gross_salary", "p.net_salary", "p.salary_date", "p.note", "p.total_days", "p.docs", "p.created_by", "ua.name as created_by_name", "p.is_deleted")
                .joinRaw(`JOIN ?? as h ON h.hotel_code = p.hotel_code`, [
                `${this.RESERVATION_SCHEMA}.${this.TABLES.hotels}`,
            ])
                .join("employee as e", "e.id", "p.employee_id")
                .join("designation as des", "des.id", "e.designation_id")
                .leftJoin("employee_deductions as ed", "ed.payroll_id", "p.id")
                .leftJoin("employee_allowances as ea", "ea.payroll_id", "p.id")
                .joinRaw(`JOIN ?? as ua ON ua.id = p.created_by`, [
                `${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
            ])
                .where("p.id", id)
                .andWhere("p.hotel_code", hotel_code)
                .andWhere("p.is_deleted", false)
                .groupBy("p.id", "h.hotel_code", "h.name", "h.address", "h.country_code", "h.city_code", "h.postal_code", "e.id", "e.name", "e.contact_no", "e.salary", "des.id", "des.name", "ua.name")
                .select(this.db.raw(`
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', ed.id,
                            'deduction_name', ed.deduction_name,
                            'deduction_amount', ed.deduction_amount,
                            'is_deleted', ed.is_deleted
                        )
                    ) FILTER (WHERE ed.id IS NOT NULL AND ed.is_deleted = false), '[]'
                ) AS deductions
            `), this.db.raw(`
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', ea.id,
                            'allowance_name', ea.allowance_name,
                            'allowance_amount', ea.allowance_amount,
                            'is_deleted', ea.is_deleted
                        )
                    ) FILTER (WHERE ea.id IS NOT NULL AND ea.is_deleted = false), '[]'
                ) AS allowances
            `))
                .first();
        });
    }
    updatePayRoll({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    updateEmployeeAllowances({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_allowances")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    updateEmployeeDeductions({ id, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ id, payload });
            return yield this.db("employee_deductions")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    getEmployeeDeductionsByPayrollId(payroll_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_deductions")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where({ payroll_id });
        });
    }
    getEmployeeAllowancesByPayrollId(payroll_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_allowances")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where({ payroll_id });
        });
    }
    deleteEmployeeDeductionsNotIn({ payroll_id, ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_deductions")
                .withSchema(this.HR_SCHEMA)
                .where({ payroll_id })
                .whereNotIn("id", ids)
                .update({ is_deleted: true });
        });
    }
    deleteEmployeeAllowancesNotIn({ payroll_id, ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee_allowances")
                .withSchema(this.HR_SCHEMA)
                .where({ payroll_id })
                .whereNotIn("id", ids)
                .update({ is_deleted: true });
        });
    }
}
exports.default = PayRollModel;
//# sourceMappingURL=payRollModel.js.map