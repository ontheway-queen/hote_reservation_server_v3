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
class ConfigurationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // --------------------------- Shift --------------------------- //
    createShift(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllShifts(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, hotel_code } = query;
            const data = yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }))
                .orderBy("start_time", "asc");
            const totalQuery = yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }))
                .first();
            return {
                total: (totalQuery && totalQuery.total) || 0,
                data,
            };
        });
    }
    getSingleShift(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .andWhere("is_deleted", false)
                .first();
        });
    }
    updateShift({ id, hotel_code, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteShift({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("shifts")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    // --------------------------- Allowances --------------------------- //
    createAllowances(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllAllowances(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, hotel_code } = query;
            const data = yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }));
            const totalQuery = yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }))
                .first();
            return {
                total: (totalQuery && totalQuery.total) || 0,
                data,
            };
        });
    }
    getSingleAllowance(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .andWhere("is_deleted", false)
                .first();
        });
    }
    updateAllowance({ id, hotel_code, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteAllowance({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("allowances")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
    // --------------------------- Deductions --------------------------- //
    createDeductions(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllDeductions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, hotel_code } = query;
            const data = yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }));
            const totalQuery = yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .count("id as total")
                .where("hotel_code", hotel_code)
                .andWhere("is_deleted", false)
                .andWhere((qb) => __awaiter(this, void 0, void 0, function* () {
                if (name) {
                    qb.andWhere("name", name);
                }
            }))
                .first();
            return {
                total: (totalQuery && totalQuery.total) || 0,
                data,
            };
        });
    }
    getSingleDeduction(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .select("*")
                .where("hotel_code", query.hotel_code)
                .andWhere("id", query.id)
                .andWhere("is_deleted", false)
                .first();
        });
    }
    updateDeduction({ id, hotel_code, payload, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    deleteDeduction({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deductions")
                .withSchema(this.HR_SCHEMA)
                .where({ id, hotel_code })
                .update({ is_deleted: true });
        });
    }
}
exports.default = ConfigurationModel;
//# sourceMappingURL=configurationModel.js.map