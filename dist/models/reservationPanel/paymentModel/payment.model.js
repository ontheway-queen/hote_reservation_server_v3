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
const schema_1 = __importDefault(require("../../../utils/miscellaneous/schema"));
class PaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createPaymentGateway(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_gateway_setting")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getPaymentGateway(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_gateway_setting as pgs")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("pgs.id", "pgs.title", "pgs.details", "pgs.status", "pgs.type", "pgs.bank_charge", "pgs.bank_charge_type", "pgs.logo", "pgs.is_default", "pgs.hotel_code", "pgs.created_by", "pgs.updated_at", this.db.raw(`COALESCE(ua.name, 'System') AS created_by_name`))
                .leftJoin("user_admin as ua", "pgs.created_by", "ua.id")
                .where((qb) => {
                qb.where("pgs.hotel_code", params.hotel_code);
                if (params.id) {
                    qb.andWhere("pgs.id", params.id);
                }
                if (params.type) {
                    qb.andWhere("pgs.type", params.type);
                }
                if (params.status) {
                    qb.andWhere("pgs.status", params.status);
                }
                if (params.is_default) {
                    qb.andWhere("pgs.is_default", params.is_default);
                }
            })
                .orderBy("pgs.is_default", "desc");
        });
    }
    getSinglePaymentGatewayByType(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_gateway_setting as pgs")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("pgs.id", "pgs.title", "pgs.details", "pgs.status", "pgs.type", "pgs.bank_charge", "pgs.bank_charge_type", "pgs.logo", "pgs.is_default", "pgs.hotel_code", "pgs.created_by", "pgs.updated_at", this.db.raw(`COALESCE(ua.name, 'System') AS created_by_name`))
                .leftJoin("user_admin as ua", "pgs.created_by", "ua.id")
                .where((qb) => {
                qb.where("pgs.hotel_code", params.hotel_code);
                qb.andWhere("pgs.type", params.type);
                qb.andWhere("pgs.status", true);
            })
                .first();
        });
    }
    getAllPaymentGatewayForBTOC(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_gateway_setting as pgs")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("pgs.id", "pgs.title", "pgs.logo", "pgs.bank_charge", "pgs.bank_charge_type")
                .where((qb) => {
                qb.where("pgs.status", 1);
                if (params.id) {
                    qb.andWhere("pgs.id", params.id);
                }
                if (params.type) {
                    qb.andWhere("pgs.type", params.type);
                }
                if (params.hotel_code) {
                    qb.andWhere("pgs.hotel_code", params.hotel_code);
                }
            })
                .orderBy("pgs.is_default", "desc");
        });
    }
    updatePaymentGateway({ payload, id, whereNotId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_gateway_setting")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (id) {
                    qb.where({ id });
                }
                if (whereNotId) {
                    qb.whereNot("id", whereNotId);
                }
            });
        });
    }
}
exports.default = PaymentModel;
//# sourceMappingURL=payment.model.js.map