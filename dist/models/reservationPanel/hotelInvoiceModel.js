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
    updateSingleFolio(payload, conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, booking_id, folio_id, folioIds } = conditions;
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where({ hotel_code })
                .andWhere({ booking_id })
                .andWhere(function () {
                if (folio_id) {
                    this.andWhere({ id: folio_id });
                }
                if (folioIds) {
                    this.whereIn("id", folioIds);
                }
            });
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
    insertInInvoiceItems(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice_items")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    insertInPurchaseSubInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase_sub_invoice")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload);
        });
    }
    insertMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipts")
                .withSchema(this.RESERVATION_SCHEMA)
                .insert(payload, "id");
        });
    }
    insertFolioMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_money_receipt")
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
                .select("inv.id", "inv.invoice_number", "inv.invoice_date", "inv.status", "inv.notes", "inv.is_void")
                .leftJoin("invoice_folios as if", "inv.id", "if.invoice_id")
                .where("inv.hotel_code", hotel_code)
                .andWhere("if.booking_id", booking_id)
                .andWhere("inv.is_void", false)
                .groupBy("inv.id");
        });
    }
    getSingleFolioInvoice({ inv_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices as inv")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("inv.id", "inv.invoice_number", "inv.invoice_date", "inv.status", "inv.notes", "b.booking_reference", "b.total_nights", "b.is_individual_booking", "b.is_company_booked", "b.company_name", "b.check_in", "b.check_out", this.db.raw("check_in::TEXT AS check_in_date"), this.db.raw("check_out::TEXT AS check_out_date"), this.db.raw(`
        JSON_BUILD_OBJECT(
          'first_name', g.first_name,
          'last_name', g.last_name,
          'nationality', g.nationality,
          'address', g.address,
          'email', g.email,
          'phone', g.phone
        ) AS main_guest_info
      `), 
            // Aggregated folio items under the invoice
            //   this.db.raw(
            //     `
            //   (
            //     SELECT JSON_AGG(
            //       JSON_BUILD_OBJECT(
            //         'id', fi.id,
            //         'folio_entry_id', fi.folio_entry_id,
            //         'description', fi.description,
            //         'type', fi.posting_type,
            //         'debit', fi.debit,
            //         'credit', fi.credit,
            //         'created_at', fi.created_at,
            //         'room',fi.room_id,
            //         'room_name', r.room_name,
            //         'room_type_name', rt.name,
            //         'rack_rate', fi.rack_rate,
            //         'date', fi.date
            //       )
            //     )
            //     FROM ?? fi
            //     left join hotel_reservation.rooms as r on r.id = fi.room_id
            //     left join hotel_reservation.room_types as rt on r.room_type_id = rt.id
            //     WHERE fi.inv_folio_id IN (
            //       SELECT f.id
            //       FROM ?? f
            //       WHERE f.invoice_id = inv.id
            //     )
            //     ORDER BY fi.id
            //   ) AS inv_items
            // `,
            //     [
            //       "hotel_reservation.invoice_folio_items",
            //       "hotel_reservation.invoice_folios",
            //     ]
            //   )
            this.db.raw(`
        (
          SELECT JSON_AGG(t)
          FROM (
            SELECT 
              fi.id,
              fi.folio_entry_id,
              fi.description,
              fi.posting_type AS type,
              fi.debit,
              fi.credit,
              fi.created_at,
              fi.room_id AS room,
              r.room_name,
              rt.name AS room_type_name,
              fi.rack_rate,
              fi.date
            FROM ?? fi
            LEFT JOIN hotel_reservation.rooms r ON r.id = fi.room_id
            LEFT JOIN hotel_reservation.room_types rt ON r.room_type_id = rt.id
            WHERE fi.inv_folio_id IN (
              SELECT f.id
              FROM ?? f
              WHERE f.invoice_id = inv.id
            )
            ORDER BY  fi.id
          ) t
        ) AS inv_items
        `, [
                "hotel_reservation.invoice_folio_items",
                "hotel_reservation.invoice_folios",
            ]))
                .leftJoin("invoice_folios as if", "inv.id", "if.invoice_id")
                .leftJoin("bookings as b", "if.booking_id", "b.id")
                .leftJoin("guests as g", "b.guest_id", "g.id")
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
    updateFolioInvoice(payload, inv_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoices")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("id", inv_id);
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
    getFoliosbySingleBooking({ hotel_code, booking_id, type, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("id", "name", "is_void", "room_id", "type")
                .where("booking_id", booking_id)
                .andWhere("hotel_code", hotel_code)
                .andWhere("is_void", false)
                .andWhere(function () {
                if (type) {
                    this.andWhere("type", type);
                }
            });
        });
    }
    getFoliosWithEntriesbySingleBooking({ hotel_code, booking_id, entry_ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", this.db.raw(`(SELECT JSON_AGG(JSON_BUILD_OBJECT('entries_id',fe.id,'description',fe.description,'posting_type',fe.posting_type,'debit',fe.debit,'credit',fe.credit,'created_at',fe.created_at,'is_void',fe.is_void,'invoiced',fe.invoiced,'date',fe.date,'room_id',fe.room_id,'room_name',r.room_name)) as folio_entries)`))
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .leftJoin("rooms as r", "fe.room_id", "r.id")
                .where("f.booking_id", booking_id)
                .andWhere("fe.is_void", false)
                .andWhere("fe.invoiced", false)
                .andWhere("f.hotel_code", hotel_code)
                .andWhere(function () {
                if (entry_ids === null || entry_ids === void 0 ? void 0 : entry_ids.length) {
                    this.whereIn("fe.id", entry_ids);
                }
            })
                .groupBy("f.id", "f.name");
        });
    }
    getFolioWithEntriesbySingleBookingAndRoomID({ hotel_code, booking_id, room_ids, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", "f.is_void", this.db.raw(`(SELECT JSON_AGG(JSON_BUILD_OBJECT('entries_id',fe.id,'description',fe.description,'posting_type',fe.posting_type,'debit',fe.debit,'credit',fe.credit,'created_at',fe.created_at,'is_void',fe.is_void,'invoiced',fe.invoiced,'date',fe.date,'room_id',fe.room_id,'room_name',r.room_name)) as folio_entries)`))
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .leftJoin("rooms as r", "fe.room_id", "r.id")
                .where("f.booking_id", booking_id)
                .andWhere("fe.is_void", false)
                .andWhere("f.hotel_code", hotel_code)
                .andWhere(function () {
                this.whereIn("f.room_id", room_ids);
            })
                .groupBy("f.id", "f.name");
        });
    }
    getSingleFoliobyHotelCodeAndFolioID(hotel_code, folio_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", "f.guest_id", "f.booking_id", "f.room_id", "b.booking_reference as booking_ref")
                .leftJoin("bookings as b", "f.booking_id", "b.id")
                .where("f.id", folio_id)
                .andWhere("f.hotel_code", hotel_code)
                .first();
        });
    }
    getFolioEntriesbyFolioID(hotel_code, folio_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries as fe")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("fe.id", "fe.description", "fe.folio_id", "fe.posting_type", "fe.rack_rate", this.db.raw(`TO_CHAR(fe.date, 'YYYY-MM-DD') as date`), "fe.room_id", "r.room_name", "fe.debit", "fe.credit", "fe.is_void")
                .join("folios as f", "fe.folio_id", "f.id")
                .leftJoin("rooms as r", "fe.room_id", "r.id")
                .where("fe.folio_id", folio_id)
                .andWhere("f.hotel_code", hotel_code)
                .andWhere("fe.is_void", false)
                .orderBy("fe.id", "asc");
        });
    }
    getFoliosEntriesbySingleBooking({ hotel_code, booking_id, entry_ids, posting_type, type, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folios as f")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("f.id", "f.name", "fe.id as entries_id", "fe.description", "fe.posting_type", "fe.debit", "fe.credit", "fe.is_void", "fe.invoiced", "fe.rack_rate", "fe.date", "fe.room_id", "r.room_name")
                .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
                .leftJoin("rooms as r", "fe.room_id", "r.id")
                .where("f.booking_id", booking_id)
                .andWhere("f.hotel_code", hotel_code)
                .andWhere("fe.is_void", false)
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
            })
                .orderBy("fe.id", "asc");
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
    updateFolioEntriesByFolioId(payload, where, exlclude_type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("folio_entries")
                .withSchema(this.RESERVATION_SCHEMA)
                .update(payload)
                .where("folio_id", where.folio_id)
                .andWhere(function () {
                if (exlclude_type === null || exlclude_type === void 0 ? void 0 : exlclude_type.exlclude) {
                    this.andWhereNot("posting_type", exlclude_type.exlclude);
                }
            });
        });
    }
    updateFolioEntriesByRoom(payload, room_id, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload, room_id, booking_id);
            return yield this.db("folio_entries as fe")
                .withSchema(this.RESERVATION_SCHEMA)
                .where("fe.room_id", room_id)
                .whereIn("fe.folio_id", function () {
                this.select("f.id")
                    .from("hotel_reservation.folios as f")
                    .where("f.booking_id", booking_id);
            })
                .update(payload);
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
    getFolioEntriesCalculationByBookingID({ hotel_code, booking_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("folio_entries as fe")
                .withSchema(this.RESERVATION_SCHEMA)
                .sum("fe.debit as total_debit")
                .sum("fe.credit as total_credit")
                .leftJoin("folios as f", "fe.folio_id", "f.id")
                .where("fe.is_void", false)
                .andWhere("f.booking_id", booking_id)
                .andWhere("f.hotel_code", hotel_code)
                .first();
            return {
                total_debit: Number((data === null || data === void 0 ? void 0 : data.total_debit) || 0),
                total_credit: Number((data === null || data === void 0 ? void 0 : data.total_credit) || 0),
            };
        });
    }
    // ------------------ Money receipt -------------------//
    getMoneyReceiptByFolio({ folio_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipts as mr")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("mr.id", "mr.receipt_no", "mr.receipt_date", "mr.amount_paid", "mr.payment_method", "mr.notes", "r.room_name", "fmr.booking_ref", "ac.name as account_name", "ua.id as received_by_id", "ua.name as received_by_name")
                .join("folio_money_receipt as fmr", "mr.id", "fmr.money_receipt_id")
                .leftJoin("rooms as r", "fmr.room_id", "r.id")
                .joinRaw("left join acc.accounts as ac on mr.acc_id =ac.id")
                .leftJoin("user_admin as ua", "mr.received_by", "ua.id")
                .where("fmr.folio_id", folio_id)
                .andWhere("mr.hotel_code", hotel_code);
        });
    }
    getMoneyReceiptById({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipts as mr")
                .withSchema(this.RESERVATION_SCHEMA)
                .select("mr.id", "mr.receipt_no", "mr.receipt_date", "mr.amount_paid", "mr.payment_method", "mr.notes", "ac.name as account_name", "ua.id as received_by_id", "ua.name as received_by_name")
                .joinRaw("left join acc.accounts as ac on mr.acc_id =ac.id")
                .leftJoin("user_admin as ua", "mr.received_by", "ua.id")
                .where("mr.id", id)
                .andWhere("mr.hotel_code", hotel_code)
                .first();
        });
    }
    getMoneyReceiptByPurchaseId({ id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("purchase as p")
                .withSchema(this.HOTEL_INVENTORY_SCHEMA)
                .select("s.id as supplier_id", "s.name as supplier_name", "s.phone as supplier_phone", "sp.id as payment_id", "sp.voucher_no as receipt_no", "sp.payment_date", "sp.debit as paid_amount", "ac.acc_type as payment_method", "sp.remarks", "ac.name as account_name", "ua.id as received_by_id", "ua.name as received_by_name")
                .leftJoin("suppliers as s", "p.supplier_id", "s.id")
                .leftJoin("supplier_payment as sp", "sp.purchase_id", "p.id")
                .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
                .joinRaw("LEFT JOIN hotel_reservation.user_admin as ua ON sp.created_by = ua.id")
                .where("sp.hotel_code", hotel_code)
                .andWhere("sp.purchase_id", id)
                .andWhere("sp.debit", ">", "0");
        });
    }
}
exports.default = HotelInvoiceModel;
//# sourceMappingURL=hotelInvoiceModel.js.map