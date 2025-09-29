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
class PurchaseInventoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // create purchase
    createPurchase(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload, "id");
        });
    }
    // update purchase
    updatePurchase(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    // Get All purchase
    getAllpurchase(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key, by_supplier_id, due } = payload;
            const dtbs = this.db("purchase as p");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("p.id", "p.purchase_no", "p.supplier_id", "p.purchase_date", "s.name as supplier_name", "p.sub_total", "p.discount_amount", "p.shipping_cost", "p.vat", "p.paid_amount", "p.grand_total", "p.due")
                .where("p.hotel_code", hotel_code)
                .leftJoin("suppliers as s", "p.supplier_id", "s.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("p.purchase_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                }
                if (due) {
                    this.andWhere("due", ">", 0);
                }
                if (by_supplier_id) {
                    this.andWhere("supplier_id", by_supplier_id);
                }
            })
                .orderBy("p.id", "desc");
            const total = yield this.db("purchase as p")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .count("p.id as total")
                .where("p.hotel_code", hotel_code)
                .leftJoin("suppliers as s", "p.supplier_id", "s.id")
                .andWhere(function () {
                if (key) {
                    this.andWhere("p.voucher_no", "like", `%${key}%`).orWhere("s.name", "like", `%${key}%`);
                }
                if (due) {
                    this.andWhere("due", ">", 0);
                }
                if (by_supplier_id) {
                    this.andWhere("supplier_id", by_supplier_id);
                }
            });
            return { total: total[0].total, data };
        });
    }
    // get single Purchase
    getSinglePurchase(id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            const dtbs = this.db("purchase_view as p");
            return yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("p.id", "p.hotel_code", "p.purchase_no", "p.purchase_date", "p.voucher_no", "p.supplier_name", "p.supplier_phone", "p.supplier_id", "p.sub_total", "p.discount_amount", "p.paid_amount", "p.vat", "p.shipping_cost", "p.grand_total", "p.due", "p.purchase_items")
                .where("p.id", id)
                .andWhere("p.hotel_code", hotel_code)
                .first();
        });
    }
    createPurchaseItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase_item")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // insert invoice supplier ledger
    insertInvSupplierLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("sup_ledger")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // get all Purchase for last id
    getAllPurchaseForLastId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase")
                .select("id")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .orderBy("id", "desc")
                .limit(1);
        });
    }
    // insert in inventory
    insertInInventory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    // update in inventory
    updateInInventory(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    // get all inventory
    getAllInventory(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { product_id, hotel_code } = where;
            return yield this.db("inventory")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("*")
                .where("hotel_code", hotel_code)
                .andWhere(function () {
                if (product_id) {
                    this.whereIn("product_id", product_id);
                }
            });
        });
    }
    // get all purchase ingredient item
    getInventoryList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, hotel_code, key } = payload;
            const dtbs = this.db("inventory as inv");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("inv.id", "inv.product_id", "ing.name", "ing.measurement", "inv.available_quantity", "inv.quantity_used")
                .leftJoin("ingredient as ing", "inv.product_id", "ing.id")
                .where({ "inv.hotel_code": hotel_code })
                .andWhere(function () {
                if (key) {
                    this.andWhere((builder) => {
                        builder.where("ing.name", "like", `%${key}%`);
                    });
                }
            });
            return { data };
        });
    }
}
exports.default = PurchaseInventoryModel;
//# sourceMappingURL=puschase.inventory.model.js.map