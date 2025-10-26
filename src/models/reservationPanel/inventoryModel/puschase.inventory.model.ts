import {
  ICreateInvPurchaseBody,
  ICreateInvPurchaseItemBody,
  IinsertInvSupplierLedger,
  ISinglePurchase,
} from "../../../appInventory/utils/interfaces/purchase.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class PurchaseInventoryModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // create purchase
  public async createPurchase(payload: ICreateInvPurchaseBody) {
    return await this.db("purchase")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload, "id");
  }

  // update purchase
  public async updatePurchase(
    payload: {
      invoice_id?: number;
      voucher_no?: string;
      due?: number;
      ac_tr_ac_id?: number;
      ac_tr_id?: number;
    },
    where: { id: number }
  ) {
    return await this.db("purchase")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  // Get All purchase
  public async getAllpurchase(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    hotel_code: number;
    by_supplier_id?: number;
    due?: number;
  }) {
    const { limit, skip, hotel_code, key, by_supplier_id, due } = payload;

    const dtbs = this.db("purchase as p");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "p.id",
        "p.purchase_no",
        "p.supplier_id",
        "p.purchase_date",
        "s.name as supplier_name",
        "p.sub_total",
        "p.discount_amount",
        "p.shipping_cost",
        "p.vat",
        "p.paid_amount",
        "p.grand_total",
        "p.due"
      )
      .where("p.hotel_code", hotel_code)
      .leftJoin("suppliers as s", "p.supplier_id", "s.id")
      .andWhere(function () {
        if (key) {
          this.andWhere("p.purchase_no", "like", `%${key}%`).orWhere(
            "s.name",
            "like",
            `%${key}%`
          );
        }

        if (due) {
          this.andWhere("due", ">", 0);
        }
        if (by_supplier_id) {
          this.andWhere("supplier_id", by_supplier_id);
        }
      })
      .orderBy("p.id", "desc");

    const total = await this.db("purchase as p")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("p.id as total")
      .where("p.hotel_code", hotel_code)
      .leftJoin("suppliers as s", "p.supplier_id", "s.id")
      .andWhere(function () {
        if (key) {
          this.andWhere("p.voucher_no", "like", `%${key}%`).orWhere(
            "s.name",
            "like",
            `%${key}%`
          );
        }
        if (due) {
          this.andWhere("due", ">", 0);
        }

        if (by_supplier_id) {
          this.andWhere("supplier_id", by_supplier_id);
        }
      });
    return { total: total[0].total, data };
  }

  // get single Purchase
  public async getSinglePurchase(
    id: number,
    hotel_code: number
  ): Promise<ISinglePurchase> {
    const dtbs = this.db("purchase_view as p");

    return await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "p.id",
        "p.hotel_code",
        "p.purchase_no",
        "p.purchase_date",
        "p.voucher_no",
        "p.supplier_name",
        "p.supplier_phone",
        "p.supplier_id",
        "p.sub_total",
        "p.discount_amount",
        "p.paid_amount",
        "p.vat",
        "p.shipping_cost",
        "p.grand_total",
        "p.due",
        "p.purchase_items"
      )
      .where("p.id", id)
      .andWhere("p.hotel_code", hotel_code)
      .first();
  }

  public async createPurchaseItem(payload: ICreateInvPurchaseItemBody[]) {
    return await this.db("purchase_item")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // insert invoice supplier ledger
  public async insertInvSupplierLedger(payload: IinsertInvSupplierLedger) {
    return await this.db("sup_ledger")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // get all Purchase for last id
  public async getAllPurchaseForLastId() {
    return await this.db("purchase")
      .select("id")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .orderBy("id", "desc")
      .limit(1);
  }

  // insert in inventory
  public async insertInInventory(
    payload: {
      hotel_code: number;
      product_id: number;
      quantity: number;
    }[]
  ) {
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // update in inventory
  public async updateInInventory(
    payload: {
      quantity?: number;
      total_damaged?: number;
      quantity_used?: number;
    },
    where: { id: number }
  ) {
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  // get all inventory
  public async getAllInventory(where: {
    hotel_code: number;
    product_id: number[];
  }) {
    const { product_id, hotel_code } = where;
    return await this.db("inventory")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (product_id) {
          this.whereIn("product_id", product_id);
        }
      });
  }

  // get all purchase ingredient item
  public async getInventoryList(payload: {
    key: string;
    hotel_code: number;
    limit: string;
    skip: string;
  }) {
    const { limit, skip, hotel_code, key } = payload;

    const dtbs = this.db("inventory as inv");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "inv.id",
        "inv.product_id",
        "ing.name",
        "ing.measurement",
        "inv.available_quantity",
        "inv.quantity_used"
      )
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
  }
}
export default PurchaseInventoryModel;
