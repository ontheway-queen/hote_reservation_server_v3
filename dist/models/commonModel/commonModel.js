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
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            const check = yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'hashed_otp as otp', 'tried')
                .andWhere('email', payload.email)
                .andWhere('type', payload.type)
                .andWhere('matched', 0)
                .andWhere('tried', '<', 3)
                .andWhereRaw(`"created_at" + interval '3 minutes' > NOW()`);
            return check;
        });
    }
    updateOTP(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where(where);
        });
    }
    getUserPassword({ table, schema, passField, userIdField, userId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(table)
                .withSchema(schema)
                .select(passField)
                .where(userIdField, userId);
        });
    }
    updatePassword({ table, userIdField, userId, passField, schema, hashedPass, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(table)
                .update(passField, hashedPass)
                .withSchema(schema)
                .where(userIdField, userId);
        });
    }
    getAllCountry() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('country')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('id', 'country_code_2_letter', 'country_code_3_letter', 'country_name', 'nationality');
        });
    }
    // insert audit trail
    // public async insetAuditTrail(payload: IInsertAuditTrailPayload) {
    //   return await this.db("auditTrail")
    //     .withSchema(this.ADMINISTRATION_SCHEMA)
    //     .insert(payload);
    // }
    // get all blood group
    getAllBloodGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('blood_group')
                .withSchema(this.DBO_SCHEMA)
                .orderBy('id', 'asc');
        });
    }
    // get all months
    getMonthList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('months')
                .withSchema(this.DBO_SCHEMA)
                .orderBy('id', 'asc');
        });
    }
}
exports.default = CommonModel;
//# sourceMappingURL=commonModel.js.map