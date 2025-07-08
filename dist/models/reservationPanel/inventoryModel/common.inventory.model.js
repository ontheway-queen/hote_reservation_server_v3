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
class CommonInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //=================== Category  ======================//
    // create Category
    createCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("category")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Category
    getAllCategory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("category as c");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("c.id", "c.hotel_code", "c.name", "c.status", "ua.id as created_by_id", "ua.name as created_by_name", "c.is_deleted")
                .joinRaw(`LEFT JOIN ?? as ua ON ua.id = c.created_by`, [
                `${this.RESERVATION_SCHEMA}.user_admin`,
            ])
                .where(function () {
                this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
            })
                .andWhere("c.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("c.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("c.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("c.id", "!=", excludeId);
                }
            })
                .orderBy("c.id", "desc");
            const total = yield this.db("category as c")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("c.id as total")
                .where(function () {
                this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
            })
                .andWhere("c.is_deleted", false)
                .andWhere(function () {
                if (name) {
                    this.andWhere("c.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("c.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("c.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Category
    updateCategory(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("category")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    // Delete Category
    deleteCategory(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("category")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .where({ id })
                .andWhere({ hotel_code })
                .andWhere({ is_deleted: false })
                .update({ is_deleted: true });
        });
    }
    //=================== Unit  ======================//
    // create Unit
    createUnit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("unit")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Unit
    getAllUnit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("unit as u");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("u.id", "u.hotel_code", "u.name", "u.status")
                .where(function () {
                this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("u.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("u.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("u.id", "!=", excludeId);
                }
            })
                .orderBy("u.id", "desc");
            const total = yield this.db("unit as u")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("u.id as total")
                .where(function () {
                this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("u.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("u.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("u.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Unit
    updateUnit(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("unit")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    //=================== Brand  ======================//
    // create Brand
    createBrand(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("brand")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Brand
    getAllBrand(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, name, status, hotel_code, excludeId } = payload;
            const dtbs = this.db("brand as b");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("b.id", "b.hotel_code", "b.name", "b.status")
                .where(function () {
                this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("b.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("b.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("b.id", "!=", excludeId);
                }
            })
                .orderBy("b.id", "desc");
            const total = yield this.db("brand as b")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("b.id as total")
                .where(function () {
                this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
            })
                .andWhere(function () {
                if (name) {
                    this.andWhere("b.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("b.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("b.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // Update Brand
    updateBrand(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("brand")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    //=================== Supplier  ======================//
    // create Supplier
    createSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    // Get All Supplier
    getAllSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { excludeId, limit, skip, hotel_code, name, status, res_id } = payload;
            const dtbs = this.db("supplier as s");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("s.id", "s.name", "s.phone", "s.status", "s.last_balance")
                .where("s.hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("s.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("s.status", "like", `%${status}%`);
                }
                if (excludeId) {
                    this.andWhere("s.id", "!=", excludeId);
                }
                if (res_id) {
                    this.andWhere("s.res_id", res_id);
                }
            })
                .orderBy("s.id", "desc");
            const total = yield this.db("supplier as s")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("s.id as total")
                .where("s.hotel_code", hotel_code)
                .andWhere(function () {
                if (name) {
                    this.andWhere("s.name", "like", `%${name}%`);
                }
                if (status) {
                    this.andWhere("s.status", "like", `%${status}%`);
                }
                if (res_id) {
                    this.andWhere("s.res_id", res_id);
                }
                if (excludeId) {
                    this.andWhere("s.id", "!=", excludeId);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single supplier
    getSingleSupplier(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier as s")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where("s.id", id)
                .andWhere("s.hotel_code", hotel_code);
        });
    }
    // Supplier payment report
    getSupplierPayment({ from_date, to_date, limit, skip, key, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const dtbs = this.db("supplier_payment as sp");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.RESERVATION_SCHEMA)
                .select("sp.id", "sp.total_paid_amount", "p.voucher_no", "ac.name as account_name", "ac.acc_type", "sp.created_at", "s.name as supplier_name")
                .leftJoin("purchase as p", "sp.purchase_id", "p.id")
                .leftJoin("account as ac", "sp.ac_tr_ac_id", "ac.id")
                .leftJoin("supplier as s", "sp.supplier_id", "s.id")
                .where(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.created_at", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere("p.voucher_no", "like", `%${key}%`)
                        .orWhere("s.name", "like", `%${key}%`)
                        .orWhere("ac.name", "like", `%${key}%`);
                }
                this.andWhereRaw("sp.res_id IS NULL");
            });
            const total = yield this.db("supplier_payment as sp")
                .withSchema(this.RESERVATION_SCHEMA)
                .count("sp.id as total")
                .leftJoin("account as ac", "sp.ac_tr_ac_id", "ac.id")
                .leftJoin("purchase as p", "sp.purchase_id", "p.id")
                .leftJoin("supplier as s", "sp.supplier_id", "s.id")
                .where(function () {
                this.andWhere("sp.hotel_code", hotel_code);
                if (from_date && endDate) {
                    this.andWhereBetween("sp.created_at", [from_date, endDate]);
                }
                if (key) {
                    this.andWhere("p.voucher_no", "like", `%${key}%`)
                        .orWhere("s.name", "like", `%${key}%`)
                        .orWhere("ac.name", "like", `%${key}%`);
                }
                this.andWhereRaw("sp.res_id IS NULL");
            });
            return { data, total: total[0].total };
        });
    }
    // Supplier ledger report
    getSupplierLedgerReport({ id, from_date, to_date, limit, skip, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            return yield this.db("supplier as s")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("s.name as supplier_name", "s.phone as supplier_phone", this.db.raw(`
          (SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', sl.id,
                'ledger_debit_amount', sl.ledger_debit_amount,
                'ledger_credit_amount', sl.ledger_credit_amount,
                'ledger_balance', sl.ledger_balance,
                'created_at', sl.created_at,
                'ledger_details', sl.ledger_details
                
              )
            )
            FROM hotel_reservation.sup_ledger as sl
            WHERE s.id = sl.supplier_id 
           ${from_date && to_date ? "and sl.created_at between ? and ?" : ""} 

           order by sl.id  ASC
          ) as supplier_ledger
        `, from_date !== undefined && to_date !== undefined
                ? [from_date, endDate]
                : []))
                .where("s.id", id)
                .groupBy("s.id");
        });
    }
    // Update supplier
    updateSupplier(id, hotel_code, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier")
                .withSchema(this.RESERVATION_SCHEMA)
                .where({ id, hotel_code })
                .update(payload);
        });
    }
    // insert supplier payment
    insertSupplierPayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("supplier_payment")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
}
exports.default = CommonInventoryModel;
//# sourceMappingURL=common.inventory.model.js.map