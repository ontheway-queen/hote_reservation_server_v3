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
class EmployeeModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create Employee
    insertEmployee(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Employee Model
    getAllEmployee(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, hotel_code, limit, skip, department, designation, status } = payload;
            console.log(payload);
            const dtbs = this.db("employee as e");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("e.id", "e.name", "e.email", "e.contact_no", this.db.raw("JSON_AGG(JSON_BUILD_OBJECT('id', d.id, 'name', d.name)) as department"), this.db.raw(`TO_CHAR(e.joining_date, 'YYYY-MM-DD') as joining_date`), "e.salary", "e.status", "de.name as designation_name", "de.id as designation_id")
                .withSchema(this.HR_SCHEMA)
                .leftJoin("emp_departments as ed", "e.id", "ed.emp_id")
                .leftJoin("department as d", "ed.department_id", "d.id")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.hotel_code", hotel_code)
                .andWhere("e.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.where("e.name", "like", `%${key}%`)
                        .orWhere("e.email", "like", `%${key}%`)
                        .orWhere("d.name", "like", `%${key}%`);
                }
                if (status) {
                    this.where("e.status", status);
                }
                if (department) {
                    this.where("d.id", department);
                }
                if (designation) {
                    this.where("de.id", designation);
                }
            })
                .groupBy("e.id", "e.name", "e.email", "e.contact_no", "e.salary", "e.joining_date", "e.status", "de.name", "de.id")
                .orderBy("e.id", "desc");
            const total = yield this.db("employee as e")
                .withSchema(this.HR_SCHEMA)
                .count("e.id as total")
                .leftJoin("emp_departments as ed", "e.id", "ed.emp_id")
                .leftJoin("department as d", "ed.department_id", "d.id")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.hotel_code", hotel_code)
                .andWhere("e.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.where("e.name", "like", `%${key}%`)
                        .orWhere("e.email", "like", `%${key}%`)
                        .orWhere("d.name", "like", `%${key}%`);
                }
            })
                .andWhere(function () {
                if (department) {
                    this.where("d.name", "like", `%${department}%`);
                }
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
    // Get Single Employee
    getSingleEmployee(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ id, hotel_code });
            return yield this.db("employee as e")
                .withSchema(this.HR_SCHEMA)
                .select("e.id", "e.name", "e.email", "e.contact_no", "e.photo", "e.blood_group as blood_group_id", "bg.name as blood_group_name", "des.id as designation_id", "des.name as designation_name", "e.salary", this.db.raw("JSON_AGG(JSON_BUILD_OBJECT('id', d.id, 'name', d.name)) as department"), this.db.raw("to_char(e.dob, 'YYYY-MM-DD') as dob"), this.db.raw("to_char(e.appointment_date, 'YYYY-MM-DD') as appointment_date"), this.db.raw("to_char(e.joining_date, 'YYYY-MM-DD') as joining_date"), "ua.id as created_by_id", "ua.name as created_by_name", "e.address", "e.status", "e.created_at", "e.is_deleted")
                .joinRaw("LEFT JOIN ??.hotels as h ON e.hotel_code = h.hotel_code", [
                this.RESERVATION_SCHEMA,
            ])
                .joinRaw("LEFT JOIN ??.user_admin as ua  ON e.created_by = ua.id", [
                this.RESERVATION_SCHEMA,
            ])
                .leftJoin("emp_departments as ed", "e.id", "ed.emp_id")
                .leftJoin("department as d", "ed.department_id", "d.id")
                .leftJoin("designation as des", "des.id", "e.designation_id")
                .joinRaw(`LEFT JOIN ?? as bg ON bg.id = e.blood_group`, [
                `${this.DBO_SCHEMA}.${this.TABLES.blood_group}`,
            ])
                .where("e.id", id)
                .andWhere("e.is_deleted", false)
                .andWhere("e.hotel_code", hotel_code)
                .groupBy("e.id", "e.name", "e.email", "e.contact_no", "e.salary", "e.joining_date", "e.status", "bg.name", "des.id", "ua.id", "ua.name")
                .first();
        });
    }
    // Update Employee
    updateEmployee(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("employee")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, is_deleted: false })
                .update(payload);
        });
    }
    // Delete Employee
    deleteEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("employee")
                .withSchema(this.HR_SCHEMA)
                .where({ id })
                .update({ is_deleted: true });
        });
    }
    // get all employee using department id
    getEmployeesByDepartmentId({ id, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("employee as e");
            if (limit && skip) {
                dtbs.limit(limit);
                dtbs.offset(skip);
            }
            const data = yield dtbs
                .select("e.id", "e.name", "e.email", "e.mobile_no", "d.name as department", "de.name as designation", "e.salary", "e.joining_date", "e.status")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("department as d", "e.department_id", "d.id")
                .leftJoin("designation as de", "e.designation_id", "de.id")
                .where("e.department_id", id)
                .andWhere("e.is_deleted", false)
                .orderBy("e.id", "desc");
            const total = yield this.db("employee as e")
                .withSchema(this.RESERVATION_SCHEMA)
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
exports.default = EmployeeModel;
//# sourceMappingURL=employeeModel.js.map