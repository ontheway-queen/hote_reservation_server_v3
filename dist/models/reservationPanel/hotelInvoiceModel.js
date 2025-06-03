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
class HotelInvoiceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertInFolio(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllFolio({ hotel_code }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "folio_number", "type", "status")
                .where("hotel_code", hotel_code);
        });
    }
    getLasFolioId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id")
                .limit(1)
                .orderBy("id", "desc");
        });
    }
    insertInFolioEntries(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getDueAmountByBookingID({ booking_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dueBalance = yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .where("f.booking_id", booking_id)
                .andWhere("f.hotel_code", hotel_code)
                .select(this.db.raw(`
        SUM(CASE WHEN fe.posting_type = 'Charge' THEN COALESCE(fe.debit, 0)
                 WHEN fe.posting_type = 'Payment' THEN - COALESCE(fe.credit, 0)
                 ELSE 0
            END) AS due_balance
      `));
            return dueBalance[0].due_balance;
        });
    }
    insertInFolioInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertInFolioInvoiceItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllFolioInvoice({ hotel_code, status, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("*")
                .where(function () {
                if (hotel_code) {
                    this.andWhere("hotel_code", hotel_code);
                }
            });
        });
    }
}
exports.default = HotelInvoiceModel;
//# sourceMappingURL=hotelInvoiceModel.js.map