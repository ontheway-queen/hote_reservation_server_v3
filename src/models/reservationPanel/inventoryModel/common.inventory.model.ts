import {
  ICreateCommonInvPayload,
  ICreateInvSupplierPayload,
  IGetCommonInv,
  IGetInvSupplier,
  IUpdateCommonInvPayload,
  IUpdateInvSupplierPayload,
} from "../../../appInventory/utils/interfaces/common.inv.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class CommonInventoryModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //=================== Category  ======================//

  // create Category
  public async createCategory(payload: ICreateCommonInvPayload) {
    return await this.db("categories")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Category
  public async getAllCategory(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
    id?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { id, limit, skip, name, status, hotel_code, excludeId } = payload;

    const dtbs = this.db("categories as c");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("c.id", "c.hotel_code", "c.name", "c.status", "c.is_deleted")
      .andWhere("c.is_deleted", false)
      .where(function () {
        this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (id) {
          this.andWhere("c.id", id);
        }
        if (name) {
          this.andWhere("c.name", "like", `%${name}%`);
        }
        if (status) {
          this.andWhere("c.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("c.id", "!=", excludeId);
        }
      })
      .orderBy("c.id", "desc");

    const total = await this.db("categories as c")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("c.id as total")
      .where(function () {
        this.whereNull("c.hotel_code").orWhere("c.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (id) {
          this.andWhere("c.id", id);
        }
        if (name) {
          this.andWhere("c.name", "like", `%${name}%`);
        }
        if (status) {
          this.andWhere("c.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("c.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Category
  public async updateCategory(id: number, payload: IUpdateCommonInvPayload) {
    return await this.db("categories")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id })
      .update(payload);
  }

  //=================== Unit  ======================//

  // create Unit
  public async createUnit(payload: ICreateCommonInvPayload) {
    return await this.db("units")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Unit
  public async getAllUnit(payload: {
    limit?: string;
    skip?: string;
    key: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { limit, skip, key, status, hotel_code, excludeId } = payload;

    const dtbs = this.db("units as u");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select(
        "u.id",
        "u.hotel_code",
        "u.name",
        "u.short_code",
        "u.status",
        "u.is_deleted"
      )
      .where(function () {
        this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
      })
      .andWhere("u.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.andWhere((qb) => {
            qb.where("u.name", "like", `%${key}%`).orWhere(
              "u.short_code",
              "like",
              `%${key}%`
            );
          });
        }

        if (status) {
          this.andWhere("u.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("u.id", "!=", excludeId);
        }
      })
      .orderBy("u.id", "desc");

    const total = await this.db("units as u")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("u.id as total")
      .where(function () {
        this.whereNull("u.hotel_code").orWhere("u.hotel_code", hotel_code);
      })
      .andWhere("u.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.andWhere((qb) => {
            qb.where("u.name", "like", `%${key}%`).orWhere(
              "u.short_code",
              "like",
              `%${key}%`
            );
          });
        }
        if (status) {
          this.andWhere("u.status", "like", `%${status}%`);
        }
        if (excludeId) {
          this.andWhere("u.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Unit
  public async updateUnit(
    id: number,
    hotel_code: number,
    payload: IUpdateCommonInvPayload
  ) {
    return await this.db("units")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  //=================== Brand  ======================//

  // create Brand
  public async createBrand(payload: ICreateCommonInvPayload) {
    return await this.db("brands")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Brand
  public async getAllBrand(payload: {
    limit?: string;
    skip?: string;
    name: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
  }): Promise<{ data: IGetCommonInv[]; total: number }> {
    const { limit, skip, name, status, hotel_code, excludeId } = payload;

    const dtbs = this.db("brands as b");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("b.id", "b.hotel_code", "b.name", "b.status", "b.is_deleted")
      .andWhere("b.is_deleted", false)
      .where(function () {
        this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (name) {
          this.andWhere("b.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (excludeId) {
          this.andWhere("b.id", "!=", excludeId);
        }
      })
      .orderBy("b.id", "desc");

    const total = await this.db("brands as b")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .count("b.id as total")
      .andWhere("b.is_deleted", false)
      .where(function () {
        this.whereNull("b.hotel_code").orWhere("b.hotel_code", hotel_code);
      })
      .andWhere(function () {
        if (name) {
          this.andWhere("b.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("b.status", status);
        }
        if (excludeId) {
          this.andWhere("b.id", "!=", excludeId);
        }
      });

    return { total: total[0].total as number, data };
  }

  // Update Brand
  public async updateBrand(
    id: number,
    hotel_code: number,
    payload: IUpdateCommonInvPayload
  ) {
    return await this.db("brands")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  //=================== Supplier  ======================//

  // create Supplier
  public async createSupplier(payload: ICreateInvSupplierPayload) {
    return await this.db("suppliers")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .insert(payload);
  }

  // Get All Supplier
  public async getAllSupplier(payload: {
    excludeId?: number;
    limit?: string;
    skip?: string;
    name?: string;
    status?: string;
    hotel_code: number;
    id?: number;
  }): Promise<{ data: IGetInvSupplier[]; total: number }> {
    const { excludeId, limit, skip, hotel_code, name, status, id } = payload;

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
        "s.last_balance",
        "s.status",
        "s.is_deleted"
      )
      .where("s.hotel_code", hotel_code)
      .andWhere(function () {
        if (name) {
          this.andWhere("s.name", "ilike", `%${name}%`);
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
        if (name) {
          this.andWhere("s.name", "ilike", `%${name}%`);
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

    return { total: total[0].total as number, data };
  }

  // get single supplier
  public async getSingleSupplier(id: number, hotel_code: number) {
    return await this.db("suppliers as s")
      .withSchema(this.HOTEL_INVENTORY_SCHEMA)
      .select("*")
      .where("s.id", id)
      .andWhere("s.hotel_code", hotel_code);
  }

  // Supplier payment report
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

  // Supplier ledger report
  public async getSupplierLedgerReport({
    id,
    from_date,
    to_date,
    limit,
    skip,
  }: {
    id: number;
    limit: string;
    skip: string;
    from_date: string;
    to_date: string;
  }) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() + 1);
    return await this.db("supplier as s")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "s.name as supplier_name",
        "s.phone as supplier_phone",
        this.db.raw(
          `
          (SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', sl.id,
                'ledger_debit_amount', sl.ledger_debit_amount,
                'ledger_credit_amount', sl.ledger_credit_amount,
                'ledger_balance', sl.ledger_balance,
                'created_at', sl.created_at,
                'ledger_details', sl.ledger_details
                
              )
            )
            FROM hotel_reservation.sup_ledger as sl
            WHERE s.id = sl.supplier_id 
           ${from_date && to_date ? "and sl.created_at between ? and ?" : ""} 

           order by sl.id  ASC
          ) as supplier_ledger
        `,
          from_date !== undefined && to_date !== undefined
            ? [from_date, endDate]
            : []
        )
      )
      .where("s.id", id)
      .groupBy("s.id");
  }

  // Update supplier
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

  // insert supplier payment
  public async insertSupplierPayment(payload: {
    hotel_code: number;
    acc_id: number;
    debit: number;
    credit: number;
    created_by: number;
    supplier_id: number;
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
}
export default CommonInventoryModel;
