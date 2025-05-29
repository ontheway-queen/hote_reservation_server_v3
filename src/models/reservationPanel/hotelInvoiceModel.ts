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
}

export default HotelInvoiceModel;
