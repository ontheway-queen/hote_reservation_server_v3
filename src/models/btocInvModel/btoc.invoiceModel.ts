import { ICreateBtocInvoicePayload } from "../../btoc/utills/interfaces/btoc.invoice.types";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

export default class BtocInvoiceModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertInvoice(
    payload: ICreateBtocInvoicePayload
  ): Promise<{ id: number }[]> {
    return await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  public async insertInvoiceItems(
    payload: { inv_id: number; name: string; amount: number }[]
  ) {
    return await this.db("invoice_items")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  public async updateInvoice(
    payload: { due?: number; status?: boolean; refund_amount?: number },
    id: number
  ) {
    await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //get invoice
  public async getInvoice(payload: {
    userId?: number;
    limit?: any;
    skip?: any;
    due?: any;
    invoice_id?: any;
    status?: boolean;
  }) {
    const { userId, limit, skip, due, invoice_id, status } = payload;
    const data = await this.db("invoice as inv")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "inv.id",
        "us.username",
        "us.first_name",
        "us.last_name",
        "us.email",
        "us.phone_number",
        "inv.total_amount",
        "inv.ref_id",
        this.db.raw("COALESCE(hb.booking_id) as ref"),
        "inv.ref_type",
        "inv.due",
        "inv.invoice_number",
        "inv.details",
        "inv.refund_amount"
      )
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

    let count: any[] = [];
    count = await this.db("btoc.invoice as inv")
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

    return { data, total: Number(count[0]?.total) };
  }

  //get single invoice
  public async singleInvoice(query: {
    id?: number;
    user_id?: number;
    invoice_number?: string;
    ref_id?: number;
    ref_type?: string;
  }) {
    const { id, invoice_number, user_id, ref_id, ref_type } = query;
    return await this.db("invoice as inv")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "inv.id",
        "inv.ref_id",
        "inv.ref_type",
        "inv.total_amount",
        "inv.due",
        "inv.details",
        "inv.invoice_number",
        "inv.created_at",
        this.db.raw(`
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'item_id', ii.id,
            'name', ii.name,
            'amount', ii.amount
          )
        ) FILTER (WHERE ii.id IS NOT NULL), '[]'
      ) as invoice_items
    `)
      )
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
      .groupBy(
        "inv.id",
        "inv.ref_id",
        "inv.ref_type",
        "inv.total_amount",
        "inv.due",
        "inv.details",
        "inv.invoice_number",
        "inv.created_at"
      );

    // .groupBy("inv.id");
  }

  //create money receipt
  public async createMoneyReceipt(payload: {
    invoice_id: number;
    amount: number;
    payment_time: string;
    transaction_id?: string;
    payment_type: string;
    details: string;
    payment_id?: string;
    payment_by?: string;
    payment_gateway?: string;
  }) {
    return await this.db("money_receipt")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "*");
  }

  //get single money receipt
  public async singleMoneyReceipt(invoice_id: number) {
    return await this.db("money_receipt")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "amount",
        "payment_time",
        "transaction_id",
        "payment_type",
        "details",
        "payment_id",
        "invoice_id",
        "payment_by"
      )
      .where({ invoice_id });
  }
}
