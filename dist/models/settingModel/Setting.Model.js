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
class SettingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Room Type  ======================//
    // create room type
    createRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Room Type
    getAllRoomType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, room_type, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("hotel_room_type as hrt");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hrt.id", "hrt.hotel_code", "hrt.room_type", "hrt.status")
                .where(function () {
                this.whereNull("hrt.hotel_code").orWhere("hrt.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (room_type) {
                    this.andWhere("hrt.room_type", "like", `%${room_type}%`);
                }
                if (status) {
                    this.andWhere("hrt.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrt.id", "!=", excludeId);
                }
            })
                .orderBy("hrt.id", "desc");
            const total = yield this.db("hotel_room_type as hrt")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hrt.id as total")
                .where(function () {
                this.whereNull("hrt.hotel_code").orWhere("hrt.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (room_type) {
                    this.andWhere("hrt.room_type", "like", `%${room_type}%`);
                }
                if (status) {
                    this.andWhere("hrt.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrt.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update room type
    updateRoomType(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Room Type
    deleteRoomType(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Bed Type  ======================//
    // create bed type
    createBedType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_bed_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All bed type
    getAllBedType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, bed_type, status, excludeId } = payload;
            const dtbs = this.db("hotel_room_bed_type as hrbt");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hrbt.id", "hrbt.hotel_code", "hrbt.bed_type", "hrbt.status")
                .where(function () {
                this.whereNull("hrbt.hotel_code").orWhere("hrbt.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (bed_type) {
                    this.andWhere("hrbt.bed_type", "like", `%${bed_type}%`);
                }
                if (status) {
                    this.andWhere("hrbt.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrbt.id", "!=", excludeId);
                }
            })
                .orderBy("hrbt.id", "desc");
            const total = yield this.db("hotel_room_bed_type as hrbt")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hrbt.id as total")
                .where(function () {
                this.whereNull("hrbt.hotel_code").orWhere("hrbt.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (bed_type) {
                    this.andWhere("hrbt.bed_type", "like", `%${bed_type}%`);
                }
                if (status) {
                    this.andWhere("hrbt.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrbt.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Bed Type
    updateBedType(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db("hotel_room_bed_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Bed Type
    deleteBedType(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_bed_type")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Room Amenities  ======================//
    // create Room Amenities
    createRoomAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_amenities_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Room Amenities
    getAllRoomAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, room_amenities, status, excludeId } = payload;
            const dtbs = this.db("hotel_room_amenities_head as hrah");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("hrah.id", "hrah.hotel_code", "hrah.room_amenities", "hrah.status")
                .where(function () {
                this.whereNull("hrah.hotel_code").orWhere("hrah.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (room_amenities) {
                    this.andWhere("hrah.room_amenities", "like", `%${room_amenities}%`);
                }
                if (status) {
                    this.andWhere("hrah.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrah.id", "!=", excludeId);
                }
            })
                .orderBy("hrah.id", "desc");
            const total = yield this.db("hotel_room_amenities_head as hrah")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("hrah.id as total")
                .where(function () {
                this.whereNull("hrah.hotel_code").orWhere("hrah.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (room_amenities) {
                    this.andWhere("hrah.room_amenities", "like", `%${room_amenities}%`);
                }
                if (status) {
                    this.andWhere("hrah.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("hrah.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Room Amenities
    updateRoomAmenities(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_amenities_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Room Amenities
    deleteRoomAmenities(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hotel_room_amenities_head")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Bank Name  ======================//
    // create Bank Name
    createBankName(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Bank Name
    getAllBankName(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name } = payload;
            const dtbs = this.db("bank_name as bn");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("bn.id", "bn.name as bank_name")
                .where("bn.hotel_code", hotel_code)
                .whereNull("bn.hotel_code")
                .andWhere(function () {
                if (name) {
                    this.andWhere("bn.name", "like", `%${name}%`);
                }
            })
                .orderBy("bn.id", "desc");
            const total = yield this.db("bank_name as bn")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("bn.id as total")
                .where("bn.hotel_code", hotel_code)
                .whereNull("bn.hotel_code")
                .andWhere(function () {
                if (name) {
                    this.andWhere("bn.name", "like", `%${name}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Bank Name
    updateBankName(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    // Delete Bank Name
    deleteBankName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_name")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .del();
        });
    }
    //=================== Designation Model  ======================//
    // create  Designation Model
    createDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All designation
    getAllDesignation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("designation as de");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("de.id", "de.hotel_code", "de.name as designation_name", "de.status")
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            })
                .orderBy("de.id", "desc");
            const total = yield this.db("designation as de")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("de.id as total")
                .where(function () {
                this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("de.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("de.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("de.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Designation
    updateDesignation(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete designation
    deleteDesignation(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("designation")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Department Model  ======================//
    // create Department
    createDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Department
    getAllDepartment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("department as d");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("d.id", "d.hotel_code", "d.name as department_name", "d.status")
                .where(function () {
                this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
            })
                .orderBy("d.id", "desc");
            const total = yield this.db("department as d")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("d.id as total")
                .where(function () {
                this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("d.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("d.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("d.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Department
    updateDepartment(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Department
    deleteDepartment(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("department")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Hall Amenities  ======================//
    // create Hall Amenities
    createHallAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Hall Amenities
    getAllHallAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name, status, excludeId } = payload;
            const dtbs = this.db("hall_amenities as ha");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("ha.id", "ha.hotel_code", "ha.name", "ha.description", "ha.status")
                .where(function () {
                this.whereNull("ha.hotel_code").orWhere("ha.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("ha.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("ha.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("ha.id", "!=", excludeId);
                }
            })
                .orderBy("ha.id", "desc");
            const total = yield this.db("hall_amenities as ha")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("ha.id as total")
                .where(function () {
                this.whereNull("ha.hotel_code").orWhere("ha.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("ha.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("ha.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("ha.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Hall Amenities
    updateHallAmenities(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // Delete Hall Amenities
    deleteHallAmenities(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("hall_amenities")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .del();
        });
    }
    //=================== Payroll Months ======================//
    // create  Payroll Months
    createPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All PayrollMonths
    getPayrollMonths(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, name } = payload;
            const dtbs = this.db("payroll_months as pm");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("pm.id", "pm.name as month_name", "pm.days as working_days", "pm.hours")
                .where("pm.hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("pm.name", "like", `%${name}%`);
                }
            })
                .orderBy("pm.id", "asc");
            const total = yield this.db("payroll_months as pm")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("pm.id as total")
                .where("pm.hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("pm.name", "like", `%${name}%`);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Payroll Months
    updatePayrollMonths(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    // Delete Payroll Months
    deletePayrollMonths(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payroll_months")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id })
                .del();
        });
    }
}
exports.default = SettingModel;
//# sourceMappingURL=Setting.Model.js.map