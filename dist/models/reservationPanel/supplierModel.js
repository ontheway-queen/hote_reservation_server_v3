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
class SupplierModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("suppliers")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    getAllSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { excludeId, limit, skip, hotel_code, key, status, id } = payload;
            const dtbs = this.db("suppliers as s");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("s.id", "s.name", "s.phone", "s.status", "s.is_deleted", this.db.raw(`COALESCE((SELECT SUM(st.credit) - SUM(st.debit) FROM ${this.HOTEL_INVENTORY_SCHEMA}.supplier_transaction AS st WHERE st.supplier_id = s.id), 0) as last_balance`))
                .where("s.hotel_code", hotel_code)
                .andWhere("s.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.andWhere("s.name", "ilike", `%${key}%`);
                }
                if (status) {
                    this.andWhere("s.status", status);
                }
                if (excludeId) {
                    this.andWhere("s.id", "!=", excludeId);
                }
                if (id) {
                    this.andWhere("s.id", id);
                }
            })
                .orderBy("s.id", "desc");
            const total = yield this.db("suppliers as s")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("s.id as total")
                .where("s.hotel_code", hotel_code)
                .andWhere("s.is_deleted", false)
                .andWhere(function () {
                if (key) {
                    this.andWhere("s.name", "ilike", `%${key}%`);
                }
                if (status) {
                    this.andWhere("s.status", status);
                }
                if (id) {
                    this.andWhere("s.id", id);
                }
                if (excludeId) {
                    this.andWhere("s.id", "!=", excludeId);
                }
            });
            return { total: Number(total[0].total), data };
        });
    }
    getSingleSupplier(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("suppliers as s")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("id", "name", "phone", "status", "created_by")
                .where("s.id", id)
                .andWhere("s.hotel_code", hotel_code);
        });
    }
    getAllSupplierInvoiceBySupId({ from_date, to_date, limit, skip, key, hotel_code, sup_id, due, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = to_date ? new Date(to_date) : undefined;
            endDate === null || endDate === void 0 ? void 0 : endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("purchase as p");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("p.id", "p.purchase_no", "p.grand_total", "p.paid_amount", "p.due")
                .leftJoin("suppliers as s", "p.supplier_id", "s.id")
                .where(function () {
                this.andWhere("p.hotel_code", hotel_code);
                this.andWhere("p.supplier_id", sup_id);
                if (from_date && endDate) {
                    this.andWhereBetween("p.purchase_date", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("p.purchase_no", "like", `%${key}%`);
                    });
                }
                if (due) {
                    this.andWhere("p.due", ">", 0);
                }
            });
            const total = yield this.db("purchase as p")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("p.id as total")
                .leftJoin("suppliers as s", "p.supplier_id", "s.id")
                .where(function () {
                this.andWhere("p.hotel_code", hotel_code);
                this.andWhere("p.supplier_id", sup_id);
                if (from_date && endDate) {
                    this.andWhereBetween("p.purchase_date", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("p.purchase_no", "like", `%${key}%`);
                    });
                }
                if (due) {
                    this.andWhere("p.due", ">", 0);
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    updateSupplier(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("suppliers")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    insertSupplierTransaction(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("supplier_transaction")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload, "id");
        });
    }
    getLastTransactionByHotel(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db("supplier_transaction")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ hotel_code })
                .orderBy("id", "desc")
                .first();
        });
    }
    getAllSupplierTransaction({ from_date, to_date, limit, skip, key, hotel_code, supplier_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("supplier_transaction as st");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("st.id", "st.debit", "st.credit", "st.transaction_no", "st.remarks", "st.created_at", "s.id as supplier_id", "s.name as supplier_name")
                .leftJoin("suppliers as s", "st.supplier_id", "s.id")
                .where(function () {
                this.andWhere("st.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("st.created_at", [from_date, endDate]);
                }
                if (supplier_id) {
                    this.andWhere("s.id", supplier_id);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("st.transaction_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                    });
                }
            })
                .orderBy("st.id", "desc");
            const total = yield this.db("supplier_transaction as st")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("st.id as total")
                .leftJoin("suppliers as s", "st.supplier_id", "s.id")
                .where(function () {
                this.andWhere("st.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("st.created_at", [from_date, endDate]);
                }
                if (supplier_id) {
                    this.andWhere("s.id", supplier_id);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("st.transaction_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                    });
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    getSingleSupplierTransactionById({ from_date, to_date, limit, skip, key, hotel_code, supplier_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("supplier_transaction as st");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("st.id", "st.debit", "st.credit", "st.transaction_no", "st.remarks", "st.created_at", "s.id as supplier_id", "s.name as supplier_name")
                .leftJoin("suppliers as s", "st.supplier_id", "s.id")
                .where("s.id", supplier_id)
                .andWhere(function () {
                this.andWhere("st.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("st.created_at", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("st.transaction_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                    });
                }
            })
                .orderBy("st.id", "desc");
            const total = yield this.db("supplier_transaction as st")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("st.id as total")
                .leftJoin("suppliers as s", "st.supplier_id", "s.id")
                .where("s.id", supplier_id)
                .andWhere(function () {
                this.andWhere("st.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("st.created_at", [from_date, endDate]);
                }
                if (supplier_id) {
                    this.andWhere("s.id", supplier_id);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("st.transaction_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                    });
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    insertSupplierPayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier_payment")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertSupplierPaymentAllocation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier_payment_allocation")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    getAllSupplierPayment({ from_date, to_date, limit, skip, key, hotel_code, supplier_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("supplier_payment as sp");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("sp.id", "sp.debit", "sp.credit", "sp.voucher_no", "ac.name as account_name", "ac.acc_type", "sp.payment_date", "s.id as supplier_id", "s.name as supplier_name")
                .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
                .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
                .where(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.payment_date", [from_date, endDate]);
                }
                if (supplier_id) {
                    this.andWhere("s.id", supplier_id);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("sp.voucher_no", "like", `%${key}%`)
                            .orWhere("s.name", "like", `%${key}%`)
                            .orWhere("ac.name", "like", `%${key}%`);
                    });
                }
            })
                .orderBy("sp.id", "desc");
            const total = yield this.db("supplier_payment as sp")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("sp.id as total")
                .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
                .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
                .where(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.payment_date", [from_date, endDate]);
                }
                if (supplier_id) {
                    this.andWhere("s.id", supplier_id);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("sp.voucher_no", "like", `%${key}%`)
                            .orWhere("s.name", "like", `%${key}%`)
                            .orWhere("ac.name", "like", `%${key}%`);
                    });
                }
            });
            return { data, total: Number(total[0].total) };
        });
    }
    getSingleSupplierPaymentById({ from_date, to_date, limit, skip, key, hotel_code, sup_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("supplier_payment as sp");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("sp.id", "sp.debit", "sp.credit", "sp.voucher_no", "ac.name as account_name", "ac.acc_type", "sp.payment_date", "s.name as supplier_name")
                .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
                .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
                .where("s.id", sup_id)
                .andWhere(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.payment_date", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("sp.voucher_no", "like", `%${key}%`)
                            .orWhere("s.name", "like", `%${key}%`)
                            .orWhere("ac.name", "like", `%${key}%`);
                    });
                }
            });
            const total = yield this.db("supplier_payment as sp")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("sp.id as total")
                .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
                .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
                .where("s.id", sup_id)
                .andWhere(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.payment_date", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere(function () {
                        this.where("sp.voucher_no", "like", `%${key}%`)
                            .orWhere("s.name", "like", `%${key}%`)
                            .orWhere("ac.name", "like", `%${key}%`);
                    });
                }
            });
            return { data, total: total[0].total };
        });
    }
    // public async getSingleSupplierPaymentById(id: number, hotel_code: number) {
    //   return await this.db("supplier_payment as sp")
    //     .withSchema(this.HOTEL_INVENTORY_SCHEMA)
    //     .select(
    //       "sp.id",
    //       "sp.debit",
    //       "sp.credit",
    //       "sp.voucher_no",
    //       "ac.name as account_name",
    //       "ac.acc_type",
    //       "sp.payment_date",
    //       "s.id as supplier_id",
    //       "s.name as supplier_name"
    //     )
    //     .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
    //     .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
    //     .where({ "sp.id": id, "sp.hotel_code": hotel_code });
    // }
    getSupplierLastBalance({ supplier_id, hotel_code, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db("supplier_payment")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select(this.db.raw("COALESCE(SUM(credit),0) - COALESCE(SUM(debit),0) as balance"))
                .where({ supplier_id, hotel_code });
            const balance = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.balance) || 0;
        });
    }
}
exports.default = SupplierModel;
//# sourceMappingURL=supplierModel.js.map