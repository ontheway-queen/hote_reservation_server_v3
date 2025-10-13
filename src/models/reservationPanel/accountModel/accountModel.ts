import {
  accType,
  IAccountCreateBody,
  IinsertLedger,
  IupdateAccount,
} from "../../../appAdmin/utlis/interfaces/account.interface";
import {
  IAccHeadDb,
  idType,
  IInsertVoucherPayload,
  IUpdateVoucherPayload,
} from "../../../appAdmin/utlis/interfaces/doubleEntry.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class AccountModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async allGroups() {
    return await this.db("acc_groups")
      .withSchema(this.ACC_SCHEMA)
      .select("code", "name", "description");
  }

  public async insertAccHead(
    payload: IAccHeadDb | IAccHeadDb[]
  ): Promise<{ id: number }[]> {
    return await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .insert(payload, "id");
  }

  public async updateAccHead(payload: any, id: idType) {
    return await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .update(payload)
      .where("head_id", id);
  }

  public async deleteAccHeadConfig({
    id,
    hotel_code,
  }: {
    id?: number;
    hotel_code?: number;
  }) {
    return await this.db("acc_head_config")
      .withSchema(this.ACC_SCHEMA)
      .update({ is_deleted: true })
      .where(function () {
        if (id) {
          this.where("id", id);
        }
        if (hotel_code) {
          this.andWhere("hotel_code", hotel_code);
        }
      });
  }

  public async deleteAccHeads({
    id,
    hotel_code,
  }: {
    id?: number;
    hotel_code?: number;
  }) {
    return await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .update({ is_deleted: true })
      .where(function () {
        if (id) {
          this.where("head_id", id);
        }
        if (hotel_code) {
          this.andWhere("hotel_code", hotel_code);
        }
      });
  }

  public async deleteAccHead(id: idType) {
    return await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .del()
      .where("id", id);
  }

  public async getAccHeadsForSelect(hotel_code: number) {
    return await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select(
        "ah.id AS head_id",
        "ah.parent_id AS head_parent_id",
        "ah.code AS head_code",
        "ah.group_code AS head_group_code",
        "ah.name AS head_name",
        "aph.code AS parent_head_code",
        "aph.name AS parent_head_name"
      )
      .leftJoin("acc_heads AS aph", { "aph.id": "ah.parent_id" })
      .where("ah.is_deleted", false)
      .andWhere("ah.hotel_code", hotel_code)
      .andWhere("ah.is_active", 1)
      .orderBy("ah.id", "asc");
  }

  public async getAllAccHeads({
    limit,
    order_by,
    search,
    skip,
    head_id,
  }: {
    limit?: number;
    order_by?: string;
    search?: string;
    skip?: number;
    head_id?: idType;
  }) {
    const data = await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .select("id", "group_code", "code", "name", "is_active")
      .modify((qb) => {
        qb.andWhere("is_deleted", false);
        if (search) {
          qb.select(
            this.db.raw(
              `
          (
            CASE 
              WHEN group_code LIKE ? THEN 3
              WHEN code LIKE ? THEN 2
              WHEN name LIKE ? THEN 1
              ELSE 0
            END
          ) AS relevance_score
        `,
              [`%${search}%`, `%${search}%`, `%${search}%`]
            )
          )
            .orWhereRaw("group_code like ?", [`%${search}%`])
            .orWhereRaw("code like ?", [`%${search}%`])
            .orWhereRaw("name like ?", [`%${search}%`])
            .orderBy("relevance_score", "desc");
        } else {
          qb.orderBy("name", order_by || "asc");
        }
        if (head_id) {
          qb.where("id", head_id);
        }
      })
      .limit(limit || 20)
      .offset(skip || 0);
    const { total } = await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .count("id as total")
      .modify((qb) => {
        if (search) {
          qb.orWhereRaw("group_code like ?", [`%${search}%`])
            .orWhereRaw("code like ?", [`%${search}%`])
            .orWhereRaw("name like ?", [`%${search}%`]);
        }
        if (head_id) {
          qb.where("id", head_id);
        }
      })
      .first();

    return { total, data };
  }

  async getAccHeadByCode(hotel_code: number, group_code: string) {
    return await this.db("acc_heads")
      .select("*")
      .withSchema(this.ACC_SCHEMA)
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere("group_code", group_code)
      .first();
  }

  public async getHeadCodeById(id: idType) {
    return await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .select("*")
      .where("id", id)
      .andWhere("is_deleted", false)
      .first();
  }

  public async getLastHeadCodeByParent(id: idType) {
    const data = (await this.db("acc_heads")
      .withSchema(this.ACC_SCHEMA)
      .select("code")
      .where("parent_id", id)
      .orderBy("id", "desc")
      .limit(1)
      .first()) as { head_code: string };

    return data?.head_code;
  }

  public getLastGroupCode = async (groupCode: string) => {
    return (await this.db("acc_head")
      .select("head_code", "head_id", "head_group_code")
      .where("head_group_code", groupCode)
      .orderBy("head_id", "desc")
      .limit(1)
      .first()) as {
      head_code: string;
      head_id: number;
      head_head_code: any;
    };
  };

  public async allAccVouchers() {
    return await this.db("v_acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .select("*");
    // .where('org_id', this.org_agency);
  }

  public async getVoucherCount() {
    const total = await this.db("acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .count("id as total");

    return total.length ? total[0].total : 0;
  }

  public async insertAccVoucher(
    payload: IInsertVoucherPayload | IInsertVoucherPayload[]
  ): Promise<{ id: number }[]> {
    return await this.db("acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .insert(payload, "id");
  }

  public async updateAccVoucher(
    payload: IUpdateVoucherPayload,
    { hotel_code, id }: { hotel_code: number; id: number }
  ) {
    return await this.db("acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .update(payload)
      .andWhere("id", id)
      .andWhere("hotel_code", hotel_code);
  }

  public async deleteAccVoucherById(id: idType) {
    return await this.db("acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .del()
      .where("id", id);
  }

  public async deleteAccVoucherByIds(ids: idType[]) {
    return await this.db("acc_vouchers")
      .withSchema(this.ACC_SCHEMA)
      .del()
      .whereIn("id", ids);
  }

  public async getSingleAccVoucherById(id: number): Promise<{
    id: number;
    acc_head_id: number;
    voucher_no: string;
    debit: string;
    credit: string;
  }> {
    return await this.db("acc_vouchers")
      .select("id", "acc_head_id", "voucher_no", "debit", "credit")
      .withSchema(this.ACC_SCHEMA)
      .where("id", id)
      .first();
  }

  public async deleteAccVoucherByVoucherNo(voucherNo: string) {
    await this.db("acc_vouchers").where("voucher_no", voucherNo).del();
  }

  // get account group
  public async getAccountGroup(code: string, status: number) {
    return await this.db("acc_group")
      .select("code", "name")
      .where((qb) => {
        if (code) {
          qb.andWhere({ code });
        }
        qb.andWhere({ status });
      });
  }

  // Get account head
  public async getAccountHead({
    hotel_code,
    code,
    group_code,
    parent_id,
    name,
    order_by,
    order_to,
    id,
    id_greater,
  }: {
    hotel_code: number;
    code?: string;
    group_code?: string;
    parent_id?: number | null;
    name?: string;
    order_by?: string;
    order_to?: "asc" | "desc";
    id?: number;
    id_greater?: number;
  }) {
    console.log({
      hotel_code,
      code,
      group_code,
      parent_id,
      order_by,
      order_to,
    });
    return await this.db("acc_heads AS ah")
      .select(
        "ah.id",
        "ah.code",
        "ah.group_code",
        "ah.parent_id",
        "ah.name",
        "ag.name AS group_name"
      )
      .withSchema(this.ACC_SCHEMA)
      .join("acc_groups AS ag", "ah.group_code", "ag.code")
      .where((qb) => {
        qb.andWhere("ah.hotel_code", hotel_code);
        qb.andWhere("ah.is_deleted", false);
        // qb.andWhere('ah.status', status);
        if (id_greater) {
          qb.andWhere("ah.id", ">", id_greater);
        }
        if (id) {
          qb.andWhere("ah.id", id);
        }
        if (code) {
          qb.andWhere("ah.code", code);
        }
        if (group_code) {
          qb.andWhere("ah.group_code", group_code);
        }
        if (parent_id) {
          qb.andWhere("ah.parent_id", parent_id);
        } else if (parent_id === null) {
          qb.whereNull("ah.parent_id");
        }
        if (name) {
          qb.andWhereILike("ah.name", `%${name}%`);
        }
      })
      .orderBy(order_by ? order_by : "ah.code", order_to ? order_to : "asc");
  }

  public async createAccount(payload: IAccountCreateBody) {
    return await this.db("accounts")
      .withSchema(this.ACC_SCHEMA)
      .insert(payload, "id");
  }

  public async checkAccName(payload: { hotel_code: number; name: string }) {
    return await this.db("accounts")
      .withSchema(this.ACC_SCHEMA)
      .andWhere("hotel_code", payload.hotel_code)
      .andWhere("name", payload.name);
  }

  // update account
  public async upadateSingleAccount(
    payload: IupdateAccount,
    where: { hotel_code: number; id: number; res_id?: number }
  ) {
    const { hotel_code, id, res_id } = where;
    return await this.db("account")
      .withSchema(this.ACC_SCHEMA)
      .update(payload)
      .where({ hotel_code })
      .andWhere(function () {
        this.andWhere({ id });
        if (res_id) {
          this.andWhere({ res_id });
        }
      });
  }

  // get all account
  public async getAllAccounts(payload: {
    hotel_code: number;
    status?: string;
    ac_type?: string;
    key?: string;
    limit?: string;
    skip?: string;
    acc_ids?: number[];
  }) {
    const { status, hotel_code, ac_type, key, limit, skip, acc_ids } = payload;

    const dtbs = this.db("accounts");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "id",
        "hotel_code",
        "name",
        "acc_type",
        "branch",
        "acc_number",
        "details",
        "is_active"
      )
      .withSchema(this.ACC_SCHEMA)
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere(function () {
        if (status) {
          this.where("is_active", status);
        }

        if (ac_type) {
          this.andWhereRaw("LOWER(acc_type) = ?", [ac_type.toLowerCase()]);
        }

        if (acc_ids) {
          this.whereIn("id", acc_ids);
        }
      })
      .andWhere(function () {
        if (key) {
          this.andWhere("name", "like", `%${key}%`).orWhere(
            "acc_number",
            "like",
            `%${key}%`
          );
        }
      })
      .orderBy("id", "desc");

    const total = await this.db("accounts")
      .withSchema(this.ACC_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere(function () {
        if (status) {
          this.where("is_active", status);
        }

        if (ac_type) {
          this.andWhereRaw("LOWER(acc_type) = ?", [ac_type.toLowerCase()]);
        }

        if (acc_ids) {
          this.whereIn("id", acc_ids);
        }
      })
      .andWhere(function () {
        if (key) {
          this.andWhere("name", "like", `%${key}%`).orWhere(
            "acc_number",
            "like",
            `%${key}%`
          );
        }
      });

    return { total: total[0].total, data };
  }

  // get single account
  public async getSingleAccount(payload: {
    hotel_code: number;
    id: number;
    type?: string;
  }): Promise<
    {
      id: number;
      acc_head_id: number;
      acc_type: accType;
      name: string;
      branch: string;
      acc_number: string;
      is_active: boolean;
      acc_routing_no: string;
      details: string;
    }[]
  > {
    const { id, type, hotel_code } = payload;
    return await this.db("accounts")
      .withSchema(this.ACC_SCHEMA)
      .select(
        "id",
        "acc_head_id",
        "acc_type",
        "name",
        "branch",
        "acc_number",
        "is_active",
        "acc_routing_no",
        "details"
      )
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere(function () {
        if (id) {
          this.andWhere({ id });
        }
        if (type) {
          this.andWhere("ac_type", type);
        }
      });
  }

  // insert in account ledger
  public async insertAccountLedger(payload: IinsertLedger) {
    return await this.db("acc_ledger")
      .withSchema(this.ACC_SCHEMA)
      .insert(payload);
  }

  // get last account ledger
  public async getLastAccountLedgerId(hotel_code: number) {
    return await this.db("acc_ledger")
      .withSchema(this.ACC_SCHEMA)
      .select("ledger_id")
      .where({ hotel_code })
      .orderBy("ledger_id", "desc")
      .limit(1);
  }

  // get ledeger by account id
  public async getAllLedgerLastBalanceByAccount(payload: {
    hotel_code: number;
    ledger_account_id: number;
  }) {
    const { hotel_code, ledger_account_id } = payload;
    const result = await this.db.raw(
      `SELECT ${this.ACC_SCHEMA}.get_ledger_balance(?, ?) AS remaining_balance`,
      [hotel_code, ledger_account_id]
    );
    const remainingBalance = result[0][0].remaining_balance;
    return remainingBalance;
  }
}
export default AccountModel;
