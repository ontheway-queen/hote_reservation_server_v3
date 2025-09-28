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
                .select("p.id", "p.voucher_no", "p.supplier_id", "p.purchase_date", "s.name as supplier_name", "p.sub_total", "p.discount_amount", "p.shipping_cost", "p.vat", "p.paid_amount", "p.grand_total", "p.due")
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
                .select("p.id", "p.hotel_code", "p.purchase_date", "p.voucher_no", "p.supplier_name", "p.supplier_phone", "p.supplier_id", "p.sub_total", "p.discount_amount", "p.paid_amount", "p.vat", "p.shipping_cost", "p.grand_total", "p.due", "p.purchase_items", "psi.inv_id as invoice_id", "inv.invoice_number as invoice_no")
                .joinRaw("left join hotel_reservation.purchase_sub_invoice as psi on p.id = psi.purchase_id")
                .joinRaw("left join hotel_reservation.invoices as inv on psi.inv_id = inv.id")
                .where("p.id", id)
                .andWhere("p.hotel_code", hotel_code)
                .first();
        });
    }
    getInvoiceByPurchaseId(purchase_id, hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase_sub_invoice as psi")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("psi.id as sub_invoice_id", "psi.inv_id as invoice_id", "inv.invoice_number", "inv.invoice_date", "inv.total_amount as invoice_total_amount", "inv.notes as invoice_notes", "p.sub_total", "p.discount_amount", "p.vat", "p.shipping_cost", "inv.due as invoice_due", "sp.name as supplier_name", "sp.phone as supplier_phone", "p.supplier_id", this.db.raw(`(SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
          'name', ii.name,
          'total_price', ii.total_price,
          'quantity', ii.quantity
        )), '[]'::json)
        FROM hotel_reservation.invoice_items as ii
        WHERE ii.inv_id = psi.inv_id) AS invoice_items`), this.db.raw(`(SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
          'receipt_id', mr.id,
          'receipt_no', mr.receipt_no
        )), '[]'::json)
        FROM hotel_reservation.money_receipt_item as mri
        JOIN hotel_reservation.money_receipts as mr
          ON mr.id = mri.money_receipt_id
        WHERE mri.invoice_id = psi.inv_id
      ) AS money_receipts`))
                .leftJoin("invoices as inv", "psi.inv_id", "inv.id")
                .joinRaw("left join hotel_inventory.purchase as p on psi.purchase_id = p.id")
                .joinRaw("LEFT JOIN hotel_inventory.suppliers as sp on p.supplier_id=sp.id")
                .where("psi.purchase_id", purchase_id)
                .andWhere("inv.hotel_code", hotel_code)
                .first();
        });
    }
    // create purchase item
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
    // ===================== purchase invoice ================//
    //   insert purchase sub invoice
    insertPurchaseSubInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase_sub_invoice")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
    //   insert purchase sub invoice item
    inserturchaseSubInvoicItem(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("pur_sub_invoice_item")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .insert(payload);
        });
    }
}
exports.default = PurchaseInventoryModel;
//# sourceMappingURL=puschase.inventory.model.js.map