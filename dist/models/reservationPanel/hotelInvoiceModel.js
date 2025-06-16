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
    insertInInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertFolioInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    getAllFolioInvoiceByBookingId({ booking_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices as inv")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("inv.id", "inv.invoice_number", "inv.invoice_date", "inv.status", "inv.notes")
                .leftJoin("invoice_folios as if", "inv.id", "if.invoice_id")
                .where("inv.hotel_code", hotel_code)
                .andWhere("if.booking_id", booking_id)
                .groupBy("inv.id");
        });
    }
    getSingleFolioInvoice({ inv_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices as inv")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("inv.id", "inv.invoice_number", "inv.invoice_date", "inv.status", "inv.notes", this.db.raw(`
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', fi.id,
              'description', fi.description,
              'type', fi.type,
              'debit', fi.debit,
              'credit', fi.credit
            )
          )
          FROM ?? fi
          WHERE fi.inv_folio_id IN (
            SELECT f.id
            FROM ?? f
            WHERE f.invoice_id = inv.id
          )
        ) AS inv_items
        `, [
                "hotel_reservation.invoice_folio_items",
                "hotel_reservation.invoice_folios",
            ]))
                .where("inv.hotel_code", hotel_code)
                .andWhere("inv.id", inv_id)
                .first();
        });
    }
    getSingleBookingRoomChargeFolioInvoice({ inv_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices as inv")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("inv.id", "inv.invoice_number", "inv.invoice_date", "inv.status", "inv.notes", this.db.raw(`
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', fi.id,
              'description', fi.description,
              'type', fi.type,
              'debit', fi.debit,
              'credit', fi.credit
            )
          )
          FROM ?? fi
          WHERE fi.inv_folio_id IN (
            SELECT f.id
            FROM ?? f
            WHERE f.invoice_id = inv.id
          )
        ) AS inv_items
        `, [
                "hotel_reservation.invoice_folio_items",
                "hotel_reservation.invoice_folios",
            ]))
                .where("inv.hotel_code", hotel_code)
                .andWhere("inv.id", inv_id)
                .first();
        });
    }
    insertInFolioInvoiceItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_folio_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    getAllInvoice({ hotel_code, status, }) {
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
    getLastInvoiceId() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db("invoices")
                .withSchema(this.RESERVATION_SCHEMA)
                .max("id as maxId")
                .first();
            return (result === null || result === void 0 ? void 0 : result.maxId) || 0;
        });
    }
    getFoliosbySingleBooking(hotel_code, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name")
                .where("booking_id", booking_id)
                .andWhere("hotel_code", hotel_code);
        });
    }
    getFoliosWithEntriesbySingleBooking({ hotel_code, booking_id, entry_ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", this.db.raw(`(SELECT JSON_AGG(JSON_BUILD_OBJECT('entries_id',fe.id,'description',fe.description,'posting_type',fe.posting_type,'debit',fe.debit,'credit',fe.credit,'created_at',fe.created_at,'is_void',fe.is_void,'invoiced',fe.invoiced)) as folio_entries)`))
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .where("booking_id", booking_id)
                .andWhere("hotel_code", hotel_code)
                .andWhere(function () {
                if (entry_ids === null || entry_ids === void 0 ? void 0 : entry_ids.length) {
                    this.whereIn("fe.id", entry_ids);
                }
            })
                .groupBy("f.id", "f.name");
        });
    }
    getSingleFoliobyHotelCodeAndFolioID(hotel_code, folio_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name", "guest_id", "booking_id")
                .where("id", folio_id)
                .andWhere("hotel_code", hotel_code)
                .first();
        });
    }
    getFolioEntriesbyFolioID(hotel_code, folio_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries as fe")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("fe.id", "fe.description", "fe.posting_type", "fe.debit", "fe.credit")
                .join("folios as f", "fe.folio_id", "f.id")
                .where("fe.folio_id", folio_id)
                .andWhere("f.hotel_code", hotel_code)
                .andWhere("fe.is_void", false);
        });
    }
    getFoliosEntriesbySingleBooking({ hotel_code, booking_id, entry_ids, posting_type, type, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", "fe.id as entries_id", "fe.description", "fe.posting_type", "fe.debit", "fe.credit", "fe.is_void", "fe.invoiced")
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .where("booking_id", booking_id)
                .andWhere("hotel_code", hotel_code)
                .andWhere(function () {
                if (entry_ids === null || entry_ids === void 0 ? void 0 : entry_ids.length) {
                    this.whereIn("fe.id", entry_ids);
                }
                if (posting_type) {
                    this.andWhereRaw("LOWER(fe.posting_type) = ?", [
                        posting_type.toLowerCase(),
                    ]);
                }
                if (type) {
                    this.andWhereRaw("LOWER(f.type) = ?", [type.toLowerCase()]);
                }
            });
        });
    }
    updateFolioEntries(payload, entryIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .whereIn("id", entryIDs);
        });
    }
    getFolioEntriesCalculation(folioEntryIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries")
                .withSchema(this.RESERVATION_SCHEMA)
                .whereIn("id", folioEntryIds)
                .andWhere("is_void", false)
                .select(this.db.raw(`
          COALESCE(SUM(debit), 0) AS total_amount,
          COALESCE(SUM(credit), 0) AS paid_amount,
          COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) AS due_amount
        `))
                .first();
        });
    }
}
exports.default = HotelInvoiceModel;
//# sourceMappingURL=hotelInvoiceModel.js.map