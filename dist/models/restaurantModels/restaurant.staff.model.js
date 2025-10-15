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
class RestaurantStaffModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertStaffData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("restaurant_staff")
                .withSchema(this.RESTAURANT_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllStaffs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, restaurant_id, name, limit, skip } = query;
            const data = yield this.db("restaurant_staff as rs")
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("rs.id", "rs.hotel_code", "rs.restaurant_id", "rs.employee_id", "e.name as employee_name", "e.photo as employee_photo", "e.email as employee_email", "e.contact_no as employee_contact_no", "e.status as employee_status", "rs.created_at", "rs.updated_at", "rs.is_deleted")
                .joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
                `${this.HR_SCHEMA}.employee`,
            ])
                .where("rs.hotel_code", hotel_code)
                .andWhere("rs.restaurant_id", restaurant_id)
                .andWhere("rs.is_deleted", false)
                .andWhere((qb) => {
                if (name) {
                    qb.andWhere("e.name", "ilike", `%${name}%`);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0);
            const countResult = yield this.db("restaurant_staff as rs")
                .withSchema(this.RESTAURANT_SCHEMA)
                .joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
                `${this.HR_SCHEMA}.employee`,
            ])
                .where("rs.hotel_code", hotel_code)
                .andWhere("rs.restaurant_id", restaurant_id)
                .andWhere("rs.is_deleted", false)
                .modify((qb) => {
                if (name) {
                    qb.andWhere("e.name", "ilike", `%${name}%`);
                }
            })
                .count("rs.id as count");
            const count = Array.isArray(countResult)
                ? countResult[0].count
                : countResult.count;
            const total = parseInt(count, 10);
            return {
                total,
                data,
            };
        });
    }
    getSingleStaff(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant_staff as rs")
                .withSchema(this.RESTAURANT_SCHEMA)
                .select("rs.id", "rs.hotel_code", "rs.restaurant_id", "rs.employee_id", "e.name as employee_name", "e.photo as employee_photo", "e.email as employee_email", "e.contact_no as employee_contact_no", "e.dob as employee_dob", "e.appointment_date as employee_appointment_date", "e.joining_date as employee_joining_date", "e.address as employee_address", "bg.name as blood_group_name", "e.status as employee_status", "rs.created_at", "rs.updated_at", "rs.is_deleted")
                .joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
                `${this.HR_SCHEMA}.employee`,
            ])
                .joinRaw(`LEFT JOIN ?? as bg ON bg.id = e.blood_group`, [
                `${this.DBO_SCHEMA}.${this.TABLES.blood_group}`,
            ])
                .where("rs.hotel_code", query.hotel_code)
                .andWhere("rs.restaurant_id", query.restaurant_id)
                .andWhere((qb) => {
                if (query.employee_id) {
                    qb.andWhere("rs.employee_id", query.employee_id);
                }
                if (query.id) {
                    qb.andWhere("rs.id", query.id);
                }
            })
                .andWhere("rs.is_deleted", false)
                .first();
        });
    }
    removeStaff(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("restaurant_staff")
                .withSchema(this.RESTAURANT_SCHEMA)
                .where("id", query.id)
                .andWhere("hotel_code", query.hotel_code)
                .andWhere("restaurant_id", query.restaurant_id)
                .andWhere("is_deleted", false)
                .update({ is_deleted: true });
        });
    }
}
exports.default = RestaurantStaffModel;
//# sourceMappingURL=restaurant.staff.model.js.map