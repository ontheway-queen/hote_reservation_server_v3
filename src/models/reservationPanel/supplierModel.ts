import {
  ICreateInvSupplierPayload,
  IGetInvSupplier,
  IUpdateInvSupplierPayload,
} from "../../appInventory/utils/interfaces/common.inv.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class SupplierModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createSupplier(payload: ICreateInvSupplierPayload) {
    return await this.db("suppliers")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  public async getAllSupplier(payload: {
    excludeId?: number;
    limit?: string;
    skip?: string;
    key?: string;
    status?: string;
    hotel_code: number;
    id?: number;
  }): Promise<{ data: IGetInvSupplier[]; total: number }> {
    const { excludeId, limit, skip, hotel_code, key, status, id } = payload;

    const dtbs = this.db("suppliers as s");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "s.id",
        "s.name",
        "s.phone",
        "s.status",
        "s.is_deleted",
        this.db.raw(
          `COALESCE((SELECT SUM(sp.credit) - SUM(sp.debit) FROM ${this.HOTEL_INVENTORY_SCHEMA}.supplier_payment AS sp WHERE sp.supplier_id = s.id), 0) as last_balance`
        )
      )

      .where("s.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("s.name", "ilike", `%${key}%`);
        }
        if (status) {
          this.andWhere("s.status", status);
        }
        if (excludeId) {
          this.andWhere("s.id", "!=", excludeId);
        }
        if (id) {
          this.andWhere("s.id", id);
        }
      })
      .orderBy("s.id", "desc");

    const total = await this.db("suppliers as s")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("s.id as total")
      .where("s.hotel_code", hotel_code)
      .andWhere(function () {
        if (key) {
          this.andWhere("s.name", "ilike", `%${key}%`);
        }
        if (status) {
          this.andWhere("s.status", status);
        }
        if (id) {
          this.andWhere("s.id", id);
        }
        if (excludeId) {
          this.andWhere("s.id", "!=", excludeId);
        }
      });

    return { total: Number(total[0].total as string), data };
  }

  public async getSingleSupplier(id: number, hotel_code: number) {
    return await this.db("suppliers as s")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("id", "name", "phone", "status", "created_by")
      .where("s.id", id)
      .andWhere("s.hotel_code", hotel_code);
  }

  public async getAllSupplierPaymentById({
    from_date,
    to_date,
    limit,
    skip,
    key,
    hotel_code,
  }: {
    hotel_code: number;
    limit: string;
    skip: string;
    key: string;
    from_date: string;
    to_date: string;
  }) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("supplier_payment as sp");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "sp.id",
        "sp.debit",
        "sp.credit",
        "sp.voucher_no",
        "ac.name as account_name",
        "ac.acc_type",
        "sp.payment_date",
        "s.name as supplier_name"
      )
      .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
      .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
      .where(function () {
        this.andWhere("sp.hotel_code", hotel_code);

        if (from_date && endDate) {
          this.andWhereBetween("sp.payment_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("sp.voucher_no", "like", `%${key}%`)
              .orWhere("s.name", "like", `%${key}%`)
              .orWhere("ac.name", "like", `%${key}%`);
          });
        }
      });

    const total = await this.db("supplier_payment as sp")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("sp.id as total")
      .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
      .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
      .where(function () {
        this.andWhere("sp.hotel_code", hotel_code);

        if (from_date && endDate) {
          this.andWhereBetween("sp.payment_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("sp.voucher_no", "like", `%${key}%`)
              .orWhere("s.name", "like", `%${key}%`)
              .orWhere("ac.name", "like", `%${key}%`);
          });
        }
      });

    return { data, total: total[0].total };
  }

  public async getAllSupplierInvoiceBySupId({
    from_date,
    to_date,
    limit,
    skip,
    key,
    hotel_code,
    sup_id,
    due,
  }: {
    hotel_code: number;
    sup_id: number;
    limit?: string;
    skip?: string;
    key?: string;
    from_date?: string;
    to_date?: string;
    due?: boolean;
  }): Promise<{
    data:
      | {
          id: number;
          voucher_no: number;
          grand_total: number;
          paid_amount: number;
          due: number;
        }[]
      | [];
    total: number;
  }> {
    const endDate = to_date ? new Date(to_date) : undefined;
    endDate?.setDate(endDate.getDate() + 1);

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
        "p.grand_total",
        "p.paid_amount",
        "p.due"
      )
      .leftJoin("suppliers as s", "p.supplier_id", "s.id")
      .where(function () {
        this.andWhere("p.hotel_code", hotel_code);
        this.andWhere("p.supplier_id", sup_id);

        if (from_date && endDate) {
          this.andWhereBetween("p.purchase_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("p.purchase_no", "like", `%${key}%`);
          });
        }

        if (due) {
          this.andWhere("p.due", ">", 0);
        }
      });

    const total = await this.db("purchase as p")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("p.id as total")
      .leftJoin("suppliers as s", "p.supplier_id", "s.id")
      .where(function () {
        this.andWhere("p.hotel_code", hotel_code);
        this.andWhere("p.supplier_id", sup_id);

        if (from_date && endDate) {
          this.andWhereBetween("p.purchase_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("p.purchase_no", "like", `%${key}%`);
          });
        }
        if (due) {
          this.andWhere("p.due", ">", 0);
        }
      });

    return { data, total: Number(total[0].total) };
  }

  public async updateSupplier(
    id: number,
    hotel_code: number,
    payload: IUpdateInvSupplierPayload
  ) {
    return await this.db("suppliers")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async insertSupplierPayment(payload: {
    hotel_code: number;
    acc_id: number;
    debit: number;
    credit: number;
    created_by: number;
    supplier_id: number;
    voucher_no: string;
    purchase_id?: number;
    payment_date?: string;
    remarks?: string;
  }): Promise<{ id: number }[]> {
    return await this.db("supplier_payment")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload, "id");
  }

  public async insertSupplierPaymentAllocation(
    payload: {
      supplier_payment_id: number;
      invoice_id: number;
      paid_amount: number;
    }[]
  ) {
    return await this.db("supplier_payment_allocation")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }
  public async getAllSupplierPayment({
    from_date,
    to_date,
    limit,
    skip,
    key,
    hotel_code,
  }: {
    hotel_code: number;
    limit: string;
    skip: string;
    key: string;
    from_date: string;
    to_date: string;
  }) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("supplier_payment as sp");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "sp.id",
        "sp.debit",
        "sp.credit",
        "sp.voucher_no",
        "ac.name as account_name",
        "ac.acc_type",
        "sp.payment_date",
        "s.id as supplier_id",
        "s.name as supplier_name"
      )
      .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
      .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
      .where(function () {
        this.andWhere("sp.hotel_code", hotel_code);

        if (from_date && endDate) {
          this.andWhereBetween("sp.payment_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("sp.voucher_no", "like", `%${key}%`)
              .orWhere("s.name", "like", `%${key}%`)
              .orWhere("ac.name", "like", `%${key}%`);
          });
        }
      })
      .orderBy("sp.id", "desc");

    const total = await this.db("supplier_payment as sp")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("sp.id as total")
      .joinRaw("LEFT JOIN acc.accounts as ac ON sp.acc_id = ac.id")
      .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
      .where(function () {
        this.andWhere("sp.hotel_code", hotel_code);

        if (from_date && endDate) {
          this.andWhereBetween("sp.payment_date", [from_date, endDate]);
        }

        if (key) {
          this.andWhere(function () {
            this.where("sp.voucher_no", "like", `%${key}%`)
              .orWhere("s.name", "like", `%${key}%`)
              .orWhere("ac.name", "like", `%${key}%`);
          });
        }
      });

    return { data, total: Number(total[0].total) };
  }
  public async getSupplierLastBalance({
    supplier_id,
    hotel_code,
  }: {
    supplier_id: number;
    hotel_code: number;
  }) {
    const result = await this.db("supplier_payment")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        this.db.raw(
          "COALESCE(SUM(credit),0) - COALESCE(SUM(debit),0) as balance"
        )
      )
      .where({ supplier_id, hotel_code });

    const balance = result[0]?.balance || 0;
  }
}
export default SupplierModel;
