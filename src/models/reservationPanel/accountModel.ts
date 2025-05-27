import {
  IAccountCreateBody,
  IAccountReqBody,
  IinsertLedger,
  IupdateAccount,
} from "../../appAdmin/utlis/interfaces/account.interface";
import {
  IAccHeadDb,
  idType,
  IVoucher,
} from "../../appAdmin/utlis/interfaces/doubleEntry.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class AccountModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async allGroups() {
    return await this.db("acc_groups")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("code", "name", "description");
  }

  public generateNextGroupCode(lastCode: string, index = 0): string {
    const parts = lastCode.split(".");
    const lastSegment = parts.pop();
    const base = parts.join(".");

    const nextNumber = parseInt(lastSegment || "0", 10) + 1 + index;
    const padded = nextNumber.toString().padStart(3, "0");

    return `${base}.${padded}`;
  }

  public async insertAccHead(payload: IAccHeadDb | IAccHeadDb[]) {
    return await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  public async updateAccHead(payload: any, id: idType) {
    return await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .update(payload)
      .where("head_id", id);
  }

  public async deleteAccHead(id: idType) {
    return await this.db("acc_head")
      .withSchema(this.RESERVATION_SCHEMA)
      // .del()
      .where("head_id", id);
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
      .withSchema(this.RESERVATION_SCHEMA)
      .select("id", "group_code", "code", "name", "is_active")
      .modify((e) => {
        if (search) {
          e.select(
            this.db.raw(
              `
          (
            CASE 
              WHEN rgoup_code LIKE ? THEN 3
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
          e.orderBy("name", order_by || "asc");
        }
        if (head_id) {
          e.where("id", head_id);
        }
      })
      .limit(limit || 20)
      .offset(skip || 0);
    const { total } = await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("id as total")
      .modify((e) => {
        if (search) {
          e.orWhereRaw("group_code like ?", [`%${search}%`])
            .orWhereRaw("code like ?", [`%${search}%`])
            .orWhereRaw("name like ?", [`%${search}%`]);
        }
        if (head_id) {
          e.where("id", head_id);
        }
      })
      .first();

    return { total, data };
  }

  public async getLastRootHeadByGroup(group_code: string) {
    return this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .where("group_code", group_code)
      .whereNull("parent_id")
      .orderByRaw("string_to_array(code, '.')::int[] DESC")
      .first();
  }

  async getLastHeadCodeByHeadCode(
    parent_id: number,
    hotel_code: number,
    group_code: string
  ) {
    return await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .where("hotel_code", hotel_code)
      .andWhere("group_code", group_code)
      .andWhere("parent_id", parent_id)
      .orderByRaw("string_to_array(code, '.')::int[] DESC")
      .first();
  }

  public async getHeadCodeByHeadId(
    id: idType
  ): Promise<{ code: string; group_code: string; parent_id: number | null }> {
    return await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("code", "group_code", "parent_id")
      .where("id", id)
      .first();
  }

  public async getGroupAndParent(id: idType): Promise<{ code: string | null }> {
    const data = await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("code")
      .where("parent_id", id)
      .orderBy("id", "desc")
      .limit(1)
      .first();

    return data?.code;
  }

  public async getLastHeadCodeByParent(id: idType) {
    const data = (await this.db("acc_heads")
      .withSchema(this.RESERVATION_SCHEMA)
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
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*");
    // .where('org_id', this.org_agency);
  }

  public async insertAccVoucher(payload: IVoucher) {
    const [id] = await this.db("acc_voucher")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);

    return id;
  }

  public async updateAccVoucher(payload: IVoucher, id: idType) {
    return await this.db("acc_voucher").update(payload).where("id", id);
  }

  public async getHeadByAccount(accountId: idType) {
    const data = (await this.db("trabill_accounts")
      .first("account_head_id")
      .where("account_id", accountId)) as { account_head_id: number };

    return data?.account_head_id;
  }

  public async deleteAccVoucher(id: idType) {
    return await this.db("acc_voucher").del().where("id", id);
  }

  public async deleteAccVouchers(voucherNo: string) {
    await this.db("acc_voucher")
      // .where('org_id', this.org_agency)
      .andWhere("voucher_no", "like", `${voucherNo}%`)
      .del();
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
    return await this.db("acc_head AS ah")
      .select(
        "ah.id",
        "ah.code",
        "ah.group_code",
        "ah.description",
        "ah.parent_id",
        "ah.name",
        "ag.name AS group_name"
      )
      .join("acc_group AS ag", "ah.group_code", "ag.code")
      .where((qb) => {
        qb.andWhere("ah.company_id", hotel_code);
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
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload, "id");
  }

  // update account
  public async upadateSingleAccount(
    payload: IupdateAccount,
    where: { hotel_code: number; id: number; res_id?: number }
  ) {
    const { hotel_code, id, res_id } = where;
    return await this.db("account")
      .withSchema(this.RESERVATION_SCHEMA)
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
    admin_id?: number;
    res_id?: number;
    acc_ids?: number[];
  }) {
    const {
      status,
      hotel_code,
      ac_type,
      key,
      limit,
      skip,
      admin_id,
      acc_ids,
      res_id,
    } = payload;

    const dtbs = this.db("account as a");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        "a.id",
        "a.hotel_code",
        "a.name",
        "a.ac_type",
        "a.bank",
        "a.branch",
        "a.account_number",
        "a.details",
        "a.status",
        "a.last_balance as available_balance",
        "a.created_at"
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where("a.hotel_code", hotel_code)
      .andWhere(function () {
        if (status) {
          this.where({ status });
        }
        if (res_id) {
          this.where({ res_id });
        }
        if (ac_type) {
          this.andWhere({ ac_type });
        }
        if (admin_id) {
          this.andWhere({ created_by: admin_id });
        }
        if (acc_ids) {
          this.whereIn("id", acc_ids);
        }
      })
      .andWhere(function () {
        if (key) {
          this.andWhere("a.name", "like", `%${key}%`)
            .orWhere("a.account_number", "like", `%${key}%`)
            .orWhere("a.bank", "like", `%${key}%`);
        }
      })
      .orderBy("a.id", "desc");

    const total = await this.db("account as a")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("a.id as total")
      .where("a.hotel_code", hotel_code)
      .andWhere(function () {
        if (status) {
          this.where({ status });
        }
        if (res_id) {
          this.where({ res_id });
        }
        if (ac_type) {
          this.andWhere({ ac_type });
        }
        if (admin_id) {
          this.andWhere({ created_by: admin_id });
        }
        if (acc_ids) {
          this.whereIn("id", acc_ids);
        }
      })
      .andWhere(function () {
        if (key) {
          this.andWhere("a.name", "like", `%${key}%`)
            .orWhere("a.account_number", "like", `%${key}%`)
            .orWhere("a.bank", "like", `%${key}%`);
        }
      });

    return { total: total[0].total, data };
  }

  // get single account
  public async getSingleAccount(payload: {
    hotel_code: number;
    id: number;
    type?: string;
    res_id?: number;
  }) {
    const { id, type, hotel_code, res_id } = payload;
    return await this.db("account_view")
      .withSchema(this.RESERVATION_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere(function () {
        if (id) {
          this.andWhere({ id });
        }
        if (res_id) {
          this.andWhere({ res_id });
        }
        if (type) {
          this.andWhere("ac_type", "like", `%${type}%`);
        }
      });
  }

  // insert in account ledger
  public async insertAccountLedger(payload: IinsertLedger) {
    return await this.db("acc_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // get last account ledger
  public async getLastAccountLedgerId(hotel_code: number) {
    return await this.db("acc_ledger")
      .withSchema(this.RESERVATION_SCHEMA)
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
      `SELECT ${this.RESERVATION_SCHEMA}.get_ledger_balance(?, ?) AS remaining_balance`,
      [hotel_code, ledger_account_id]
    );
    const remainingBalance = result[0][0].remaining_balance;
    return remainingBalance;
  }
}
export default AccountModel;
