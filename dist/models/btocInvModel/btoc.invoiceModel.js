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
class BtocInvoiceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert invoice model
    insertInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertInvoiceItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_items")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    //update invoice
    updateInvoice(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //get invoice
    getInvoice(payload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, limit, skip, due, invoice_id, status } = payload;
            const data = yield this.db("invoice as inv")
                .withSchema(this.BTOC_SCHEMA)
                .select("inv.id", "us.username", "us.first_name", "us.last_name", "us.email", "us.phone_number", "inv.total_amount", "inv.ref_id", this.db.raw("COALESCE(hb.booking_id) as ref"), "inv.ref_type", "inv.due", "inv.invoice_number", "inv.details", "inv.refund_amount")
                .leftJoin("hotel_booking as hb", "inv.ref_id", "hb.id")
                .leftJoin("users as us", "us.id", "inv.user_id")
                .orderBy("inv.id", "desc")
                .limit(limit || 100)
                .offset(skip || 0)
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (due === "true") {
                    qb.andWhereNot("inv.due", 0);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (status) {
                    qb.andWhere("inv.status", true);
                }
            });
            let count = [];
            count = yield this.db("btoc.invoice as inv")
                .count("inv.id as total")
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (due === "true") {
                    qb.andWhereNot("inv.due", 0);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (status) {
                    qb.andWhere("inv.status", true);
                }
            });
            return { data, total: Number((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) };
        });
    }
    //get single invoice
    singleInvoice(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, invoice_number, user_id, ref_id, ref_type } = query;
            return yield this.db("invoice as inv")
                .withSchema(this.BTOC_SCHEMA)
                .select("inv.id", "inv.ref_id", "inv.ref_type", "inv.total_amount", "inv.due", "inv.details", "inv.invoice_number", "inv.created_at", this.db.raw(`
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'item_id', ii.id,
            'name', ii.name,
            'amount', ii.amount
          )
        ) FILTER (WHERE ii.id IS NOT NULL), '[]'
      ) as invoice_items
    `))
                .leftJoin("invoice_items as ii", "inv.id", "ii.inv_id")
                .where((qb) => {
                qb.andWhere("inv.status", true);
                if (user_id) {
                    qb.andWhere("inv.user_id", user_id);
                }
                if (id) {
                    qb.andWhere("inv.id", id);
                }
                if (invoice_number) {
                    qb.andWhere("inv.invoice_number", invoice_number);
                }
                if (ref_id) {
                    qb.andWhere("inv.ref_id", ref_id); // added inv. prefix
                }
                if (ref_type) {
                    qb.andWhere("inv.ref_type", ref_type); // added inv. prefix
                }
            })
                .groupBy("inv.id", "inv.ref_id", "inv.ref_type", "inv.total_amount", "inv.due", "inv.details", "inv.invoice_number", "inv.created_at");
            // .groupBy("inv.id");
        });
    }
    //create money receipt
    createMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "*");
        });
    }
    //get single money receipt
    singleMoneyReceipt(invoice_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.BTOC_SCHEMA)
                .select("amount", "payment_time", "transaction_id", "payment_type", "details", "payment_id", "invoice_id", "payment_by")
                .where({ invoice_id });
        });
    }
}
exports.default = BtocInvoiceModel;
//# sourceMappingURL=btoc.invoiceModel.js.map