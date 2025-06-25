import { idType } from "../../../appAdmin/utlis/interfaces/doubleEntry.interface";
import {
  AccountJournalTransactions,
  AccTransactionParams,
} from "../../../appAdmin/utlis/interfaces/report.interface";
import { TDB } from "../../../common/types/commontypes";
import Schema from "../../../utils/miscellaneous/schema";

class ReportModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getAccountsTransactions({
    headIds,
    from_date,
    to_date,
  }: AccTransactionParams): Promise<AccountJournalTransactions[]> {
    return await this.db(`${this.ACC_SCHEMA}.acc_vouchers AS av`)
      .select(
        "av.id",
        "av.acc_head_id",
        "av.voucher_no",
        "av.voucher_date",
        "av.voucher_type",
        "av.description",
        "av.debit",
        "av.credit",
        "ah.code AS acc_head_code",
        "ah.name AS acc_head_name",
        "ah.parent_id",
        "aph.name AS parent_acc_head_name",
        "ua.name AS created_by",
        "av.created_at"
      )
      .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS ah`, "av.acc_head_id", "ah.id")
      .leftJoin(`${this.ACC_SCHEMA}.acc_heads AS aph`, {
        "aph.id": "ah.parent_id",
      })
      .leftJoin(
        `${this.RESERVATION_SCHEMA}.user_admin AS ua`,
        "av.created_by",
        "ua.id"
      )
      .where("av.is_deleted", false)
      .andWhere((qb) => {
        if (Array.isArray(headIds) && headIds.length) {
          qb.whereIn("av.acc_head_id", headIds);
        }

        if (from_date && to_date) {
          qb.andWhereRaw("Date(av.voucher_date) BETWEEN ? AND ?", [
            from_date,
            to_date,
          ]);
        }
      });
  }

  public async getAccHeadInfo(head_id: idType) {
    return await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select(
        "ah.id",
        "ah.parent_id",
        "ah.code",
        "ah.group_code",
        "ah.name",
        "ah.hotel_code"
      )
      .where("id", head_id)
      .first();
  }

  public async getAccHeads() {
    return (await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select("ah.id", "ah.name", "ah.parent_id")) as {
      id: number;
      name: string;
      parent_id: number;
    }[];
  }

  public async getTrialBalanceReport({
    from_date,
    to_date,
    group_code,
  }: AccTransactionParams) {
    let subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as debit`;
    let subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as credit`;
    if (from_date && to_date) {
      subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as debit`;
      subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from ${this.ACC_SCHEMA}.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as credit`;
    }

    return await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select(
        "ah.id",
        "ah.parent_id",
        "ah.code",
        "ah.group_code",
        "ah.name",
        "ag.name AS group_name",
        this.db.raw(subQueryDebit),
        this.db.raw(subQueryCredit)
      )
      .leftJoin("acc_groups AS ag", { "ag.code": "ah.group_code" })
      .where((qb) => {
        if (group_code) {
          qb.andWhere("ah.group_code", group_code);
        }
      });
  }

  public async getRoomBookingReport({
    hotel_code,
    from_date,
    to_date,
    booking_type,
    status,
    limit,
    skip,
  }: {
    hotel_code: number;
    from_date: string;
    to_date: string;
    booking_type?: string;
    status?: string;
    limit?: string;
    skip?: string;
  }) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("booking_rooms AS br");

    if (limit && skip) {
      dtbs.limit(parseInt(limit)).offset(parseInt(skip));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "br.id",
        "b.id as booking_id",
        "b.check_in",
        "b.check_out",
        "b.booking_type",
        "b.status",
        "b.comments",
        "b.company_name",
        "b.visit_purpose",
        "r.room_name as room_no",
        "r.floor_no",
        "b.check_in",
        "b.check_out",
        "b.booking_date",
        "br.cbf",
        "br.adults",
        "br.children as child_count",
        "br.infant",
        "b.guest_id",
        "g.first_name",
        "g.last_name",
        "g.country",
        "g.nationality",
        "g.address",
        "g.email AS guest_email",
        "g.phone AS guest_phone"
      )
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      .leftJoin("guests AS g", "b.guest_id", "g.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        if (from_date && to_date) {
          qb.whereBetween("b.check_in", [from_date, endDate]);
        }
        if (booking_type) {
          qb.andWhere("b.booking_type", booking_type);
        }
        if (status) {
          qb.andWhere("b.status", status);
        }
      });

    const total = await this.db("booking_rooms AS br")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("br.id as total")
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      .leftJoin("guests AS g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        if (from_date && to_date) {
          qb.whereBetween("b.booking_date", [from_date, endDate]);
        }
        if (booking_type) {
          qb.andWhere("b.booking_type", booking_type);
        }
        if (status) {
          qb.andWhere("b.status", status);
        }
      });

    return {
      data,
      total: Number(total[0]?.total || 0),
    };
  }
}
export default ReportModel;
