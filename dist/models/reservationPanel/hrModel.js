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
class HrModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
        });
    }
    getAllDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("designation as de");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HR_SCHEMA)
                .select("de.id", "de.hotel_code", "de.name as designation_name", "de.status", "de.is_deleted", "de.created_by as created_by_id", "ua.name as created_by_name")
                .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = de.created_by`, [
                this.RESERVATION_SCHEMA,
            ])
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere("de.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", status);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            })
                .orderBy("de.id", "desc");
            const total = yield this.db("designation as de")
                .withSchema(this.HR_SCHEMA)
                .count("de.id as total")
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere("de.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", status);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    updateDesignation(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteDesignation(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    createPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
        });
    }
    getPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, month_id } = payload;
            let dtbs = this.db("payroll_months as pm").withSchema(this.HR_SCHEMA);
            if (limit && skip) {
                dtbs = dtbs.limit(parseInt(limit));
                dtbs = dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("pm.id", "months.name as month_name", "pm.days as working_days", "pm.hours", "pm.is_deleted")
                .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.months}`,
            ])
                .where("pm.hotel_code", hotel_code)
                .andWhere("pm.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
                }
                if (month_id) {
                    this.andWhere("months.id", month_id);
                }
            })
                .orderBy("pm.id", "asc");
            // New query builder for count
            let countQuery = this.db("payroll_months as pm").withSchema(this.HR_SCHEMA);
            const totalResult = yield countQuery
                .count("pm.id as total")
                .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.months}`,
            ])
                .where("pm.hotel_code", hotel_code)
                .andWhere("pm.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
                }
                if (month_id) {
                    this.andWhere("months.id", month_id);
                }
            });
            const total = totalResult[0].total;
            return { total, data };
        });
    }
    updatePayrollMonths(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update(payload);
        });
    }
    deletePayrollMonths(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .andWhere("is_deleted", false)
                .update({ is_deleted: true });
        });
    }
    createDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
        });
    }
    getAllDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId, ids } = payload;
            const dtbs = this.db("department as d");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HR_SCHEMA)
                .select("d.id", "d.hotel_code", "d.name as department_name", "d.status", "d.is_deleted", "d.created_by as created_by_id", "ua.name as created_by_name")
                .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = d.created_by`, [
                this.RESERVATION_SCHEMA,
            ])
                .where("d.hotel_code", hotel_code)
                .andWhere("d.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", status);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("d.id", ids);
                }
            })
                .orderBy("d.id", "desc");
            const total = yield this.db("department as d")
                .withSchema(this.HR_SCHEMA)
                .count("d.id as total")
                .where(function () {
                this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
            })
                .andWhere("d.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "ilike", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", status);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
                if (ids === null || ids === void 0 ? void 0 : ids.length) {
                    this.whereIn("d.id", ids);
                }
            });
            return { total: Number(total[0].total), data };
        });
    }
    getSingleDepartment(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department as d")
                .withSchema(this.HR_SCHEMA)
                .select("d.id", "d.hotel_code", "d.name", "d.status", "d.is_deleted", "ua.id as created_by_id", "ua.name as created_by_name")
                .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = d.created_by`, [
                this.RESERVATION_SCHEMA,
            ])
                .where("d.id", id)
                .andWhere("d.hotel_code", hotel_code)
                .andWhere("d.is_deleted", false)
                .first();
        });
    }
    updateDepartment(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteDepartment(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    insertEmployee(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee")
                .withSchema(this.HR_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertIntoEmpDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            return yield this.db("emp_departments")
                .withSchema(this.HR_SCHEMA)
                .insert(payload);
        });
    }
    hasEmpDepartmentAlreadyExist(emp_id, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("emp_departments")
                .withSchema(this.HR_SCHEMA)
                .select("department_id")
                .whereIn("department_id", ids)
                .andWhere({ emp_id });
        });
    }
    removeDepartmentFromEmployee(emp_id, removeIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("emp_departments")
                .withSchema(this.HR_SCHEMA)
                .del()
                .whereIn("department_id", removeIds)
                .where("emp_id", emp_id);
        });
    }
    getAllEmployee(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, limit, skip, department, designation } = payload;
            const dtbs = this.db("employee as e");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("e.id", "e.name", "e.email", "e.contact_no", "e.salary", "e.joining_date", "e.status")
                .withSchema(this.HR_SCHEMA)
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.hotel_code", hotel_code)
                .andWhere("e.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.where("e.name", "like", `%${key}%`).orWhere("e.email", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (designation) {
                    this.where("de.name", "like", `%${designation}%`);
                }
            })
                .orderBy("e.id", "desc");
            const total = yield this.db("employee as e")
                .withSchema(this.HR_SCHEMA)
                .count("e.id as total")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.hotel_code", hotel_code)
                .andWhere("e.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.where("e.name", "like", `%${key}%`).orWhere("e.email", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (designation) {
                    this.where("de.name", "like", `%${designation}%`);
                }
            });
            return {
                data,
                total: Number(total[0].total),
            };
        });
    }
    getSingleEmployee(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("employee as e")
                .withSchema(this.HR_SCHEMA)
                .select("e.id", "e.name", "e.email", "e.mobile_no", "e.photo", "e.blood_group as blood_group_id", "bg.name as blood_group_name", "dep.id as department_id", "dep.name as department_name", "des.id as designation_id", "des.name as designation_name", "e.salary", this.db.raw("to_char(e.dob, 'YYYY-MM-DD') as dob"), this.db.raw("to_char(e.appointment_date, 'YYYY-MM-DD') as appointment_date"), this.db.raw("to_char(e.joining_date, 'YYYY-MM-DD') as joining_date"), "e.hotel_code", "h.name as hotel_name", "ua.id as created_by_id", "ua.name as created_by_name", "e.address", "e.status", "e.created_at", "e.is_deleted")
                .join("hotels as h", "h.hotel_code", "e.hotel_code")
                .join("department as dep", "e.department_id", "dep.id")
                .join("designation as des", "des.id", "e.designation_id")
                .join("user_admin as ua", "ua.id", "e.created_by")
                .joinRaw(`JOIN ?? as bg ON bg.id = e.blood_group`, [
                `${this.DBO_SCHEMA}.${this.TABLES.blood_group}`,
            ])
                .where("e.id", id)
                .andWhere("e.is_deleted", false)
                .andWhere("e.hotel_code", hotel_code)
                .first();
            return data ? data : null;
        });
    }
    updateEmployee(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("employee")
                .withSchema(this.HR_SCHEMA)
                .where({ id, is_deleted: false })
                .update(payload);
        });
    }
    deleteEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee")
                .withSchema(this.HR_SCHEMA)
                .where({ id, is_deleted: false })
                .update({ is_deleted: true });
        });
    }
    getEmployeesByDepartmentId({ id, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("employee as e");
            if (limit && skip) {
                dtbs.limit(limit);
                dtbs.offset(skip);
            }
            const data = yield dtbs
                .select("e.id", "e.name", "e.email", "e.mobile_no", "d.name as department", "de.name as designation", "e.salary", "e.joining_date", "e.status")
                .withSchema(this.HR_SCHEMA)
                .leftJoin("department as d", "e.department_id", "d.id")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.department_id", id)
                .andWhere("e.is_deleted", false)
                .orderBy("e.id", "desc");
            const total = yield this.db("employee as e")
                .withSchema(this.HR_SCHEMA)
                .count("e.id as total")
                .leftJoin("department as d", "e.department_id", "d.id")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.department_id", id)
                .andWhere("e.is_deleted", false);
            return {
                total: Number(total[0].total),
                data,
            };
        });
    }
}
exports.default = HrModel;
//# sourceMappingURL=hrModel.js.map