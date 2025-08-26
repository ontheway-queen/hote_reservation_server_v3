import { idType } from "../../../appAdmin/utlis/interfaces/doubleEntry.interface";
import {
  AccountJournalTransactions,
  AccTransactionParams,
  AccTransactionPayload,
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
    hotel_code,
  }: AccTransactionPayload): Promise<AccountJournalTransactions[]> {
    console.log({ headIds });
    return await this.db(`${this.ACC_SCHEMA}.acc_vouchers AS av`)
      .select(
        "av.id",
        "av.acc_head_id",
        "av.voucher_no",
        this.db.raw("DATE(av.voucher_date)"),
        "av.description",
        "av.debit",
        "av.credit",
        "ah.code AS acc_head_code",
        "ah.name AS acc_head_name",
        "ah.parent_id",
        "aph.name AS parent_acc_head_name",
        "ua.name AS created_by",
        "ag.name AS group_name",
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
      .leftJoin(
        `${this.ACC_SCHEMA}.acc_groups AS ag`,
        "ah.group_code",
        "ag.code"
      )
      .where("av.is_deleted", false)
      .andWhere("av.hotel_code", hotel_code)
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
      })
      .orderBy("av.id", "asc");
  }

  public async getAccHeadInfo(head_id: idType, hotel_code: number) {
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
      .andWhere("ah.hotel_code", hotel_code)
      .first();
  }

  public async getAccHeads(hotel_code: number) {
    return (await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select("ah.id", "ah.name", "ah.parent_id")
      .where("ah.hotel_code", hotel_code)) as {
      id: number;
      name: string;
      parent_id: number;
    }[];
  }

  public async getTrialBalanceReport({
    from_date,
    to_date,
    group_code,
    hotel_code,
  }: AccTransactionPayload) {
    let subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) 
    FROM ${this.ACC_SCHEMA}.acc_vouchers AS av 
    WHERE av.acc_head_id = ah.id 
      AND av.is_deleted = false 
      AND av.hotel_code = ${hotel_code}) AS debit`;

    let subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) 
    FROM ${this.ACC_SCHEMA}.acc_vouchers AS av 
    WHERE av.acc_head_id = ah.id 
      AND av.is_deleted = false 
      AND av.hotel_code = ${hotel_code}) AS credit`;

    if (from_date && to_date) {
      subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) 
      FROM ${this.ACC_SCHEMA}.acc_vouchers AS av 
      WHERE av.acc_head_id = ah.id 
        AND av.is_deleted = false 
        AND av.hotel_code = ${hotel_code} 
        AND av.voucher_date BETWEEN '${from_date}' AND '${to_date}') AS debit`;

      subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) 
      FROM ${this.ACC_SCHEMA}.acc_vouchers AS av 
      WHERE av.acc_head_id = ah.id 
        AND av.is_deleted = false 
        AND av.hotel_code = ${hotel_code} 
        AND av.voucher_date BETWEEN '${from_date}' AND '${to_date}') AS credit`;
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
      .where("ah.hotel_code", hotel_code)
      .where((qb) => {
        if (group_code) {
          qb.andWhere("ah.group_code", group_code);
        }
      });
  }

  public async getAccHeadsForSelect(hotel_code: number) {
    return await this.db("acc_heads AS ah")
      .withSchema(this.ACC_SCHEMA)
      .select(
        "ah.hotel_code",
        "ah.id AS head_id",
        "ah.parent_id AS head_parent_id",
        "ah.code AS head_code",
        "ah.group_code AS head_group_code",
        "ah.name AS head_name",
        "aph.code AS parent_head_code",
        "aph.name AS parent_head_name"
      )
      .leftJoin("acc_heads AS aph", "aph.id", "ah.parent_id")
      .where("ah.is_deleted", 0)
      .andWhere("ah.hotel_code", hotel_code)
      .andWhere("ah.is_active", 1)
      .orderBy("ah.id", "asc");
  }

  public async inhouseGuestListReport({
    hotel_code,
    current_date,
    search,
    limit,
    room_id,
    skip,
  }: {
    hotel_code: number;
    current_date: string;
    search: string;
    room_id?: string;
    limit?: string;
    skip?: string;
  }) {
    const dtbs = this.db("booking_rooms AS br");

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "br.id",
        "b.id as booking_id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(br.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(br.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.is_individual_booking",
        "b.status",
        "b.comments",
        "b.company_name",
        "b.visit_purpose",
        "r.id as room_id",
        "r.room_name as room_no",
        "r.floor_no",
        "br.cbf",
        "br.adults",
        "br.children as child_count",
        "br.infant",
        this.db.raw("COALESCE(brg.guest_id, b.guest_id) AS guest_id"),
        this.db.raw(
          "COALESCE(brg.is_room_primary_guest, false) AS is_room_primary_guest"
        ),
        this.db.raw("COALESCE(g.first_name, g2.first_name) AS first_name"),
        this.db.raw("COALESCE(g.last_name, g2.last_name) AS last_name"),
        this.db.raw("COALESCE(g.passport_no, g2.passport_no) AS passport_no"),
        this.db.raw("COALESCE(g.address, g2.address) AS address"),
        this.db.raw("COALESCE(g.email, g2.email) AS guest_email"),
        this.db.raw("COALESCE(g.phone, g2.phone) AS phone"),
        this.db.raw("COALESCE(c.country_name, c2.country_name) AS country"),
        this.db.raw("COALESCE(c.nationality, c2.nationality) AS nationality")
      )
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      .leftJoin("booking_room_guest as brg", function () {
        this.on("br.id", "=", "brg.booking_room_id").andOnVal(
          "brg.is_room_primary_guest",
          "=",
          true
        );
      })
      .leftJoin("guests AS g", "brg.guest_id", "g.id")
      .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw(
          "Date(br.check_out) >= ?",
          [current_date]
        );
        qb.andWhere("b.booking_type", "B");

        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

            sub
              .whereRaw("b.company_name ILIKE ?", [like])

              .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                like,
              ])
              .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                like,
              ])
              .orWhereRaw(
                `(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("r.id", room_id);
        }
      })
      .orderByRaw("CAST(r.room_name AS INTEGER) ASC");

    const total = await this.db("booking_rooms AS br")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("br.id as total")
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      .leftJoin("booking_room_guest as brg", function () {
        this.on("br.id", "=", "brg.booking_room_id").andOnVal(
          "brg.is_room_primary_guest",
          "=",
          true
        );
      })
      .leftJoin("guests AS g", "brg.guest_id", "g.id")
      .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw(
          "Date(br.check_out) >= ?",
          [current_date]
        );
        qb.andWhere("b.booking_type", "B");

        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

            sub
              .whereRaw("b.company_name ILIKE ?", [like])

              .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                like,
              ])
              .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                like,
              ])
              .orWhereRaw(
                `(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("br.room_id", room_id);
        }
      });

    // const [info] = await this.db("booking_rooms AS br")
    //   .withSchema(this.RESERVATION_SCHEMA)
    //   .select(
    //     this.db.raw("SUM(br.cbf) AS total_cbf"),
    //     this.db.raw("SUM(br.adults) AS total_adults"),
    //     this.db.raw("SUM(br.children) AS total_children"),
    //     this.db.raw("SUM(br.infant) AS total_infant"),
    //     this.db.raw("SUM(br.adults + br.children + br.infant) AS total_person")
    //   )
    //   .leftJoin("bookings AS b", "br.booking_id", "b.id")
    //   .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
    //   .leftJoin("guests AS g", "brg.guest_id", "g.id")
    //   .leftJoin("guests as g2", "b.guest_id", "g2.id")
    //   .leftJoin("rooms AS r", "br.room_id", "r.id")
    //   .joinRaw("Left Join public.country as c on g.country_id = c.id")
    //   .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
    //   .where("b.hotel_code", hotel_code)
    //   .andWhere((qb) => {
    //     qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw(
    //       "Date(br.check_out) >= ?",
    //       [current_date]
    //     );
    //     qb.andWhere("b.booking_type", "B");
    //     qb.andWhere("br.status", "checked_in");

    //     if (search) {
    //       qb.andWhere((sub) => {
    //         const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

    //         sub
    //           .whereRaw("b.company_name ILIKE ?", [like])

    //           .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
    //             like,
    //           ])
    //           .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
    //             like,
    //           ])
    //           .orWhereRaw(
    //             `(
    //        COALESCE(g.first_name, g2.first_name, '')
    //        || ' ' ||
    //        COALESCE(g.last_name,  g2.last_name,  '')
    //      ) ILIKE ?`,
    //             [like]
    //           )
    //           .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
    //           .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
    //           .orWhereILike("r.room_name", like);
    //       });
    //     }

    //     if (room_id) {
    //       qb.andWhere("br.room_id", room_id);
    //     }
    //   });

    const [info] = await this.db("booking_rooms AS br")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        this.db.raw("SUM(br.cbf) AS total_cbf"),
        this.db.raw("SUM(br.adults) AS total_adults"),
        this.db.raw("SUM(br.children) AS total_children"),
        this.db.raw("SUM(br.infant) AS total_infant"),
        this.db.raw("SUM(br.adults + br.children + br.infant) AS total_person")
      )
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_in) <= ?", [current_date]).andWhereRaw(
          "Date(br.check_out) >= ?",
          [current_date]
        );
        qb.andWhere("b.booking_type", "B");
        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
            sub
              .whereRaw("b.company_name ILIKE ?", [like])
              .orWhereRaw("r.room_name ILIKE ?", [like]);
          });
        }

        if (room_id) {
          qb.andWhere("br.room_id", room_id);
        }
      });

    return {
      data,
      total: Number(total[0]?.total || 0),
      total_cbf: Number(info?.total_cbf || 0),
      total_adult: Number(info?.total_adults || 0),
      total_children: Number(info?.total_children || 0),
      total_infant: Number(info?.total_infant || 0),
      total_person: Number(info?.total_person || 0),
    };
  }

  public async departureRoomListReport({
    hotel_code,
    current_date,
    search,
    limit,
    room_id,
    skip,
  }: {
    hotel_code: number;
    current_date: string;
    search: string;
    room_id?: string;
    limit?: string;
    skip?: string;
  }) {
    const dtbs = this.db("booking_rooms AS br");

    if (limit && skip) {
      dtbs.limit(parseInt(limit)).offset(parseInt(skip));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "br.id",
        "b.id as booking_id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(br.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(br.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.is_individual_booking",
        "b.status",
        "b.comments",
        "b.company_name",
        "b.visit_purpose",
        "r.id as room_id",
        "r.room_name as room_no",
        "r.floor_no",
        "br.cbf",
        "br.adults",
        "br.children as child_count",
        "br.infant",
        this.db.raw("COALESCE(brg.guest_id, b.guest_id) AS guest_id"),
        this.db.raw("COALESCE(g.first_name, g2.first_name) AS first_name"),
        this.db.raw("COALESCE(g.last_name, g2.last_name) AS last_name"),
        this.db.raw("COALESCE(g.passport_no, g2.passport_no) AS passport_no"),
        this.db.raw("COALESCE(g.address, g2.address) AS address"),
        this.db.raw("COALESCE(g.email, g2.email) AS guest_email"),
        this.db.raw("COALESCE(g.phone, g2.phone) AS phone"),
        this.db.raw("COALESCE(c.country_name, c2.country_name) AS country"),
        this.db.raw("COALESCE(c.nationality, c2.nationality) AS nationality"),
        this.db.raw(
          "COALESCE(brg.is_room_primary_guest, false) AS is_room_primary_guest"
        )
      )
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
      // .leftJoin("guests AS g", "brg.guest_id", "g.id")
      // .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("booking_room_guest as brg", function () {
        this.on("br.id", "=", "brg.booking_room_id").andOnVal(
          "brg.is_room_primary_guest",
          "=",
          true
        );
      })
      .leftJoin("guests AS g", "brg.guest_id", "g.id")
      .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_out) = ?", [current_date]);
        qb.andWhere("b.booking_type", "B");
        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

            sub
              .whereRaw("b.company_name ILIKE ?", [like])

              .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                like,
              ])
              .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                like,
              ])
              .orWhereRaw(
                `(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("r.id", room_id);
        }
      })
      .orderByRaw("CAST(r.room_name AS INTEGER) ASC");

    const total = await this.db("booking_rooms AS br")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("br.id as total")
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
      // .leftJoin("guests AS g", "brg.guest_id", "g.id")
      // .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("booking_room_guest as brg", function () {
        this.on("br.id", "=", "brg.booking_room_id").andOnVal(
          "brg.is_room_primary_guest",
          "=",
          true
        );
      })
      .leftJoin("guests AS g", "brg.guest_id", "g.id")
      .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_out) = ?", [current_date]);
        qb.andWhere("b.booking_type", "B");
        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

            sub
              .whereRaw("b.company_name ILIKE ?", [like])

              .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                like,
              ])
              .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                like,
              ])
              .orWhereRaw(
                `(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("br.room_id", room_id);
        }
      });

    const [info] = await this.db("booking_rooms AS br")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        this.db.raw("SUM(br.cbf) AS total_cbf"),
        this.db.raw("SUM(br.adults) AS total_adults"),
        this.db.raw("SUM(br.children) AS total_children"),
        this.db.raw("SUM(br.infant) AS total_infant"),
        this.db.raw("SUM(br.adults + br.children + br.infant) AS total_person")
      )
      .leftJoin("bookings AS b", "br.booking_id", "b.id")
      // .leftJoin("booking_room_guest as brg", "br.id", "brg.booking_room_id")
      // .leftJoin("guests AS g", "brg.guest_id", "g.id")
      // .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("booking_room_guest as brg", function () {
        this.on("br.id", "=", "brg.booking_room_id").andOnVal(
          "brg.is_room_primary_guest",
          "=",
          true
        );
      })
      .leftJoin("guests AS g", "brg.guest_id", "g.id")
      .leftJoin("guests as g2", "b.guest_id", "g2.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .joinRaw("Left Join public.country as c on g.country_id = c.id")
      .joinRaw("Left Join public.country as c2 on g2.country_id = c2.id")
      .where("b.hotel_code", hotel_code)
      .andWhere((qb) => {
        qb.whereRaw("Date(br.check_out) = ?", [current_date]);
        qb.andWhere("b.booking_type", "B");
        qb.andWhere("br.status", "checked_in");

        if (search) {
          qb.andWhere((sub) => {
            const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;

            sub
              .whereRaw("b.company_name ILIKE ?", [like])

              .orWhereRaw("COALESCE(g.first_name, g2.first_name) ILIKE ?", [
                like,
              ])
              .orWhereRaw("COALESCE(g.last_name,  g2.last_name)  ILIKE ?", [
                like,
              ])
              .orWhereRaw(
                `(
           COALESCE(g.first_name, g2.first_name, '')
           || ' ' ||
           COALESCE(g.last_name,  g2.last_name,  '')
         ) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, g2.email) ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, g2.phone) ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("br.room_id", room_id);
        }
      });

    return {
      data,
      total: Number(total[0]?.total || 0),
      total_cbf: Number(info?.total_cbf || 0),
      total_adult: Number(info?.total_adults || 0),
      total_children: Number(info?.total_children || 0),
      total_infant: Number(info?.total_infant || 0),
      total_person: Number(info?.total_person || 0),
    };
  }

  public async arrivalRoomListReport({
    hotel_code,
    current_date,
    search,
    limit,
    room_id,
    skip,
  }: {
    hotel_code: number;
    current_date: string;
    search: string;
    room_id?: string;
    limit?: string;
    skip?: string;
  }): Promise<{
    data: {
      booking_id: number;
      booking_reference: string;
      booking_date: string;
      booking_type: string;
      is_individual_booking: boolean;
      status: string;
      comments: string;
      company_name: string;
      visit_purpose: string;
      guest_id: number;
      first_name: string;
      last_name: string;
      passport_no: string;
      address: string;
      guest_email: string;
      phone: string;
      country: string;
      rooms: {
        room_id: number;
        room_no: string;
      }[];
    }[];
    total: number;
  }> {
    const dtbs = this.db("bookings AS b").withSchema(this.RESERVATION_SCHEMA);

    if (limit && skip) {
      dtbs.limit(parseInt(limit)).offset(parseInt(skip));
    }

    const data = await dtbs
      .select(
        "b.id as booking_id",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.is_individual_booking",
        "b.status",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        "b.comments",
        "b.company_name",
        "b.visit_purpose",
        "g.id AS guest_id",
        "g.first_name",
        "g.last_name",
        "g.passport_no",
        "g.address",
        "g.email AS guest_email",
        "g.phone",
        "c.country_name AS country",
        "c.nationality",
        "ua.id as reservation_by_id",
        "ua.name as reservation_by_name",
        this.db.raw(`Count(br.id) AS total_reserved_rooms`),
        this.db.raw(`(SELECT sum(fe.credit) from hotel_reservation.folios as f 
          left join hotel_reservation.folio_entries as fe on f.id = fe.folio_id
          where f.booking_id = b.id and fe.is_void = false) as total_paid_amount
          `),
        this.db.raw(`
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT('changed_rate', br.unit_changed_rate)
    ) FILTER (WHERE br.unit_changed_rate IS NOT NULL),
    '[]'
  ) as "changed_rates"
`),
        this.db.raw(`
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'room_id', r.id,
            'room_no', r.room_name
          )
        ) FILTER (WHERE br.id IS NOT NULL),
        '[]'
      ) AS rooms
    `)
      )
      .leftJoin("booking_rooms AS br", "br.booking_id", "b.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .leftJoin("guests AS g", "b.guest_id", "g.id")
      .leftJoin("user_admin AS ua", "b.created_by", "ua.id")
      .joinRaw(" left join public.country AS c  on g.country_id= c.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.booking_type", "B")
      .andWhere("br.status", "confirmed")
      .andWhereRaw("DATE(br.check_in) = ?", [current_date])
      .andWhere((qb) => {
        if (search) {
          const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
          qb.andWhere((sub) => {
            sub
              .whereRaw("b.company_name ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.first_name, '') ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.last_name, '') ILIKE ?", [like])
              .orWhereRaw(
                `(COALESCE(g.first_name, '') || ' ' || COALESCE(g.last_name, '')) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, '') ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, '') ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("r.id", room_id);
        }
      })
      .groupBy(
        "b.id",
        "g.id",
        "c.country_name",
        "c.nationality",
        "ua.id",
        "ua.name"
      );

    const total = await this.db("bookings AS b")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("b.id as total")
      .leftJoin("booking_rooms AS br", "br.booking_id", "b.id")
      .leftJoin("rooms AS r", "br.room_id", "r.id")
      .leftJoin("guests AS g", "b.guest_id", "g.id")
      .leftJoin("user_admin AS ua", "b.created_by", "ua.id")
      .joinRaw(" left join public.country AS c  on g.country_id= c.id")
      .where("b.hotel_code", hotel_code)
      .andWhere("b.booking_type", "B")
      .andWhere("br.status", "confirmed")
      .andWhereRaw("DATE(br.check_in) = ?", [current_date])
      .andWhere((qb) => {
        if (search) {
          const like = `${search.replace(/[\\%_]/g, "\\$&")}%`;
          qb.andWhere((sub) => {
            sub
              .whereRaw("b.company_name ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.first_name, '') ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.last_name, '') ILIKE ?", [like])
              .orWhereRaw(
                `(COALESCE(g.first_name, '') || ' ' || COALESCE(g.last_name, '')) ILIKE ?`,
                [like]
              )
              .orWhereRaw("COALESCE(g.email, '') ILIKE ?", [like])
              .orWhereRaw("COALESCE(g.phone, '') ILIKE ?", [like])
              .orWhereILike("r.room_name", like);
          });
        }

        if (room_id) {
          qb.andWhere("r.id", room_id);
        }
      })
      .groupBy(
        "b.id",
        "g.id",
        "c.country_name",
        "c.nationality",
        "ua.id",
        "ua.name"
      );

    return {
      data,
      total: Number(total[0]?.total || 0),
    };
  }

  public async getAllReservationByRoom({
    hotel_code,
    checkin,
    checkout,
    booking_type,
    status,
    limit,
    skip,
    room_id,
  }: {
    hotel_code: number;
    limit?: string;
    skip?: string;
    checkin?: string;
    checkout?: string;
    status?: string;
    booking_type?: string;
    room_id: number;
  }) {
    const endCheckInDate = checkin ? new Date(checkin) : null;
    const endCheckOutDate = checkout ? new Date(checkout) : null;

    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = skip ? Number(skip) : 0;

    // ============== MAIN DATA QUERY ==============
    const data = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "b.id",
        "b.hotel_code",
        "b.booking_reference",
        this.db.raw(`TO_CHAR(b.check_in, 'YYYY-MM-DD') as check_in`),
        this.db.raw(`TO_CHAR(b.check_out, 'YYYY-MM-DD') as check_out`),
        this.db.raw(`TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date`),
        "b.booking_type",
        "b.status",
        "b.is_individual_booking",
        "b.total_amount",
        "b.vat",
        "b.discount_amount",
        "b.service_charge",
        "b.source_id",
        "src.name as source_name",
        "b.company_name",
        "b.pickup",
        "b.pickup_from",
        "b.pickup_time",
        "b.drop",
        "b.drop_time",
        "b.drop_to",
        "b.visit_purpose",
        "b.comments",
        "g.id as guest_id",
        "g.first_name",
        "g.last_name",
        "g.email as guest_email",
        "g.phone as guest_phone",
        this.db.raw(
          `(
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'id', br.id,
            'room_type_id', br.room_type_id,
            'room_type_name', rt.name,
            'room_id', br.room_id,
            'room_name', r.room_name,
            'adults', br.adults,
            'children', br.children,
            'infant', br.infant,
            'status', br.status
          ))
          FROM ?? AS br
          LEFT JOIN ?? AS rt ON br.room_type_id = rt.id
          LEFT JOIN ?? AS r ON br.room_id = r.id
          WHERE br.booking_id = b.id
        ) AS booking_rooms`,
          [
            "hotel_reservation.booking_rooms",
            "hotel_reservation.room_types",
            "hotel_reservation.rooms",
          ]
        )
      )
      .leftJoin("sources as src", "b.source_id", "src.id")
      .leftJoin("guests as g", "b.guest_id", "g.id")
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (checkin && checkout) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhereRaw("br.check_in <= ? AND br.check_out >= ?", [
                endCheckOutDate,
                endCheckInDate,
              ]);
          });
        }

        if (room_id) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhere("br.room_id", room_id);
          });
        }

        if (status) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhere("br.status", status);
          });
        }

        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      })
      .orderBy("b.id", "desc")
      .limit(limitNum)
      .offset(offsetNum);

    // ============== TOTAL COUNT QUERY ==============
    const total = await this.db("bookings as b")
      .withSchema(this.RESERVATION_SCHEMA)
      .countDistinct("b.id as total") // ✅ distinct count
      .where("b.hotel_code", hotel_code)
      .andWhere(function () {
        if (checkin && checkout) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhereRaw("br.check_in <= ? AND br.check_out >= ?", [
                endCheckOutDate,
                endCheckInDate,
              ]);
          });
        }

        if (room_id) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhere("br.room_id", room_id);
          });
        }

        if (status) {
          this.whereExists(function () {
            this.select(this.client.raw("1"))
              .from("hotel_reservation.booking_rooms as br")
              .whereRaw("br.booking_id = b.id")
              .andWhere("br.status", status);
          });
        }

        if (booking_type) {
          this.andWhere("b.booking_type", booking_type);
        }
      });

    return {
      data,
      total: total[0]?.total ? parseInt(total[0]?.total as string) : 0,
    };
  }
}
export default ReportModel;
