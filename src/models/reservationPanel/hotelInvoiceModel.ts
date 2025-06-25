import {
  IinsertFolioEntriesPayload,
  IinsertFolioPayload,
  ISingleFolioInvoice,
} from "../../appAdmin/utlis/interfaces/invoice.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HotelInvoiceModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertInFolio(payload: IinsertFolioPayload) {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllFolio({ hotel_code }: { hotel_code: number }) {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "folio_number", "type", "status")
      .where("hotel_code", hotel_code);
  }

  public async getLasFolioId() {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id")
      .limit(1)
      .orderBy("id", "desc");
  }

  public async insertInFolioEntries(
    payload: IinsertFolioEntriesPayload | IinsertFolioEntriesPayload[]
  ) {
    return await this.db("folio_entries")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getDueAmountByBookingID({
    booking_id,
    hotel_code,
  }: {
    booking_id: number;
    hotel_code: number;
  }): Promise<number> {
    const dueBalance = await this.db("folios as f")
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
      .where("f.booking_id", booking_id)
      .andWhere("f.hotel_code", hotel_code)
      .select(
        this.db.raw(`
        SUM(CASE WHEN fe.posting_type = 'Charge' THEN COALESCE(fe.debit, 0)
                 WHEN fe.posting_type = 'Payment' THEN - COALESCE(fe.credit, 0)
                 ELSE 0
            END) AS due_balance
      `)
      );

    return dueBalance[0].due_balance;
  }

  public async insertInInvoice(payload: {
    hotel_code: number;
    invoice_number: string;
    invoice_date: string;
    total_amount: number;
    notes?: string;
  }) {
    return await this.db("invoices")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async insertFolioInvoice(payload: {
    invoice_id: number;
    folio_id: number;
    booking_id: number;
  }) {
    return await this.db("invoice_folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllFolioInvoiceByBookingId({
    booking_id,
    hotel_code,
  }: {
    hotel_code: number;
    booking_id: number;
  }) {
    return await this.db("invoices as inv")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "inv.id",
        "inv.invoice_number",
        "inv.invoice_date",
        "inv.status",
        "inv.notes",
        "inv.is_void"
      )
      .leftJoin("invoice_folios as if", "inv.id", "if.invoice_id")
      .where("inv.hotel_code", hotel_code)
      .andWhere("if.booking_id", booking_id)
      .andWhere("inv.is_void", false)
      .groupBy("inv.id");
  }

  public async getSingleFolioInvoice({
    inv_id,
    hotel_code,
  }: {
    hotel_code: number;
    inv_id: number;
  }): Promise<ISingleFolioInvoice> {
    return await this.db("invoices as inv")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "inv.id",
        "inv.invoice_number",
        "inv.invoice_date",
        "inv.status",
        "inv.notes",
        "b.booking_reference",
        "b.total_nights",
        "b.is_company_booked",
        "b.company_name",
        "b.check_in",
        "b.check_out",
        this.db.raw("check_in::TEXT AS check_in_date"),
        this.db.raw("check_out::TEXT AS check_out_date"),
        this.db.raw(`
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
        this.db.raw(
          `
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', fi.id,
              'folio_entry_id', fi.folio_entry_id,
              'description', fi.description,
              'type', fi.posting_type,
              'debit', fi.debit,
              'credit', fi.credit,
              'created_at', fi.created_at,
              'room',fi.room_id,
              'room_name', r.room_name,
              'room_type_name', rt.name,
              'rack_rate', fi.rack_rate,
              'date', fi.date
            )
          )
          FROM ?? fi
          left join hotel_reservation.rooms as r on r.id = fi.room_id
          left join hotel_reservation.room_types as rt on r.room_type_id = rt.id
          WHERE fi.inv_folio_id IN (
            SELECT f.id
            FROM ?? f
            WHERE f.invoice_id = inv.id
          )
        ) AS inv_items
      `,
          [
            "hotel_reservation.invoice_folio_items",
            "hotel_reservation.invoice_folios",
          ]
        )
      )
      .leftJoin("invoice_folios as if", "inv.id", "if.invoice_id")
      .leftJoin("bookings as b", "if.booking_id", "b.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("inv.hotel_code", hotel_code)
      .andWhere("inv.id", inv_id)
      .first();
  }

  public async getSingleBookingRoomChargeFolioInvoice({
    inv_id,
    hotel_code,
  }: {
    hotel_code: number;
    inv_id: number;
  }) {
    return await this.db("invoices as inv")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "inv.id",
        "inv.invoice_number",
        "inv.invoice_date",
        "inv.status",
        "inv.notes",
        this.db.raw(
          `
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
        `,
          [
            "hotel_reservation.invoice_folio_items",
            "hotel_reservation.invoice_folios",
          ]
        )
      )
      .where("inv.hotel_code", hotel_code)
      .andWhere("inv.id", inv_id)
      .first();
  }

  public async updateFolioInvoice(
    payload: { is_void?: boolean },
    inv_id: number
  ) {
    return await this.db("invoices")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("id", inv_id);
  }

  public async insertInFolioInvoiceItems(
    payload: {
      inv_folio_id: number;
      folio_entry_id: number;
      description: string;
      posting_type: string;
      debit: number;
      credit: number;
      folio_id: number;
      rack_rate: number;
      date: string;
    }[]
  ) {
    return await this.db("invoice_folio_items")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  public async getAllInvoice({
    hotel_code,
    status,
  }: {
    hotel_code: number;
    status: string;
  }) {
    return await this.db("invoices")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where(function () {
        if (hotel_code) {
          this.andWhere("hotel_code", hotel_code);
        }
      });
  }

  public async getLastInvoiceId() {
    const result = await this.db("invoices")
      .withSchema(this.RESERVATION_SCHEMA)
      .max("id as maxId")
      .first();

    return result?.maxId || 0;
  }

  public async getFoliosbySingleBooking(
    hotel_code: number,
    booking_id: number
  ): Promise<{ id: number; name: string }[]> {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name")
      .where("booking_id", booking_id)
      .andWhere("hotel_code", hotel_code);
  }

  public async getFoliosWithEntriesbySingleBooking({
    hotel_code,
    booking_id,
    entry_ids,
  }: {
    hotel_code: number;
    booking_id: number;
    entry_ids?: number[];
  }): Promise<{ id: number; name: string }[]> {
    return await this.db("folios as f")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "f.id",
        "f.name",
        this.db.raw(
          `(SELECT JSON_AGG(JSON_BUILD_OBJECT('entries_id',fe.id,'description',fe.description,'posting_type',fe.posting_type,'debit',fe.debit,'credit',fe.credit,'created_at',fe.created_at,'is_void',fe.is_void,'invoiced',fe.invoiced)) as folio_entries)`
        )
      )
      .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")

      .where("f.booking_id", booking_id)
      .andWhere("fe.is_void", false)
      .andWhere("fe.invoiced", false)
      .andWhere("f.hotel_code", hotel_code)
      .andWhere(function () {
        if (entry_ids?.length) {
          this.whereIn("fe.id", entry_ids);
        }
      })
      .groupBy("f.id", "f.name");
  }

  public async getSingleFoliobyHotelCodeAndFolioID(
    hotel_code: number,
    folio_id: number
  ): Promise<
    | {
        id: number;
        name: string;
        guest_id: number;
        booking_id: string;
      }
    | undefined
  > {
    return await this.db("folios")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "name", "guest_id", "booking_id")
      .where("id", folio_id)
      .andWhere("hotel_code", hotel_code)
      .first();
  }

  public async getFolioEntriesbyFolioID(
    hotel_code: number,
    folio_id: number
  ): Promise<
    {
      id: number;
      description: string;
      posting_type: string;
      rack_rate: number;
      date: string;
      room_id: number | null;
      room_name: string | null;
      debit: number;
      credit: number;
    }[]
  > {
    return await this.db("folio_entries as fe")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "fe.id",
        "fe.description",
        "fe.posting_type",
        "fe.rack_rate",
        "fe.date",
        "fe.room_id",
        "r.room_name",
        "fe.debit",
        "fe.credit"
      )
      .join("folios as f", "fe.folio_id", "f.id")
      .leftJoin("rooms as r", "fe.room_id", "r.id")
      .where("fe.folio_id", folio_id)
      .andWhere("f.hotel_code", hotel_code)
      .andWhere("fe.is_void", false);
  }

  public async getFoliosEntriesbySingleBooking({
    hotel_code,
    booking_id,
    entry_ids,
    posting_type,
    type,
  }: {
    hotel_code: number;
    booking_id: number;
    posting_type?: string;
    type?: string;
    entry_ids?: number[];
  }): Promise<
    {
      id: number;
      name: string;
      entries_id: number;
      description: string;
      posting_type: string;
      debit: number;
      credit: number;
      is_void: boolean;

      invoiced: boolean;
      rack_rate: number;
      date: string;
      room_id: number | null;
      room_name: string | null;
    }[]
  > {
    return await this.db("folios as f")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "f.id",
        "f.name",
        "fe.id as entries_id",
        "fe.description",
        "fe.posting_type",
        "fe.debit",
        "fe.credit",
        "fe.is_void",
        "fe.invoiced",
        "fe.rack_rate",
        "fe.date",
        "fe.room_id",
        "r.room_name"
      )
      .leftJoin("folio_entries as fe", "f.id", "fe.folio_id")
      .leftJoin("rooms as r", "fe.room_id", "r.id")
      .where("f.booking_id", booking_id)
      .andWhere("f.hotel_code", hotel_code)
      .andWhere("fe.is_void", false)
      .andWhere(function () {
        if (entry_ids?.length) {
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
  }

  public async updateFolioEntries(
    payload: { is_void?: boolean; invoiced?: boolean },
    entryIDs: number[]
  ) {
    return await this.db("folio_entries")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .whereIn("id", entryIDs);
  }

  public async getFolioEntriesCalculation(folioEntryIds: number[]): Promise<{
    total_amount: number;
    paid_amount: number;
    due_amount: number;
  }> {
    return await this.db("folio_entries")
      .withSchema(this.RESERVATION_SCHEMA)
      .whereIn("id", folioEntryIds)
      .andWhere("is_void", false)
      .select(
        this.db.raw(`
          COALESCE(SUM(debit), 0) AS total_amount,
          COALESCE(SUM(credit), 0) AS paid_amount,
          COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) AS due_amount
        `)
      )
      .first();
  }
}

export default HotelInvoiceModel;
