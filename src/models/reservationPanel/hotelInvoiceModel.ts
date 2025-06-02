import {
  IinsertFolioEntriesPayload,
  IinsertFolioPayload,
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

  public async insertInFolioEntries(payload: IinsertFolioEntriesPayload) {
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
}

export default HotelInvoiceModel;
