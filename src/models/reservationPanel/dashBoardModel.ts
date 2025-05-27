import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class DashBoardModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // invoice due amount
  public async getAllInvoice(payload: {
    hotel_code: number;
    from_date?: string;
    to_date?: string;
  }) {
    const { hotel_code, from_date, to_date } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db("inv_view as iv");

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select("iv.invoice_id", "iv.due")
      .where("iv.hotel_code", hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      })
      .orderBy("iv.invoice_id", "desc");

    const total = await this.db("inv_view as iv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("invoice_id as total")
      .where("iv.hotel_code", hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      });

    const totalAmount = await this.db("inv_view as iv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("invoice_id as total")
      .sum("iv.due as totalAmount")
      .where({ hotel_code })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("iv.created_at", [from_date, endDate]);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total: total[0].total,
    };
  }

  // room booking report
  public async getRoomBookingReport(payload: {
    from_date?: string;
    limit?: string;
    skip?: string;
    to_date: string;
    hotel_code: number;
  }) {
    const { from_date, to_date, hotel_code } = payload;

    // exact end date
    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    // for ending room booking
    const total_pending_room_booking = await this.db("room_booking_view as rbv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rbv.id as total_pending_room")
      .where({ hotel_code, status: "pending" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    // for ending room booking
    const total_rejected_room_booking = await this.db(
      "room_booking_view as rbv"
    )
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rbv.id as total_rejected_room")
      .where({ hotel_code, status: "rejected" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    // for count total
    const total_approved_room_booking = await this.db(
      "room_booking_view as rbv"
    )
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rbv.id as total_approved_room")
      .where({ hotel_code, status: "approved" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    const totalBookingAmount = await this.db("room_booking_view as rbv")
      .count("rbv.id as total")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("rbv.grand_total as totalAmount")
      .where({ hotel_code, status: "approved", pay_status: 1 })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    return {
      totalBookingAmount: totalBookingAmount[0].totalAmount,
      total_approved_room_booking:
        total_approved_room_booking[0].total_approved_room,
      total_rejected_room_booking:
        total_rejected_room_booking[0].total_rejected_room,
      total_pending_room_booking:
        total_pending_room_booking[0].total_pending_room,
    };
  }

  // get all hall report
  public async getHallBookingReport(payload: {
    limit?: string;
    skip?: string;
    from_date: string;
    to_date: string;
    hotel_code: number;
    booking_status?: string;
    user_id?: string;
  }) {
    const { limit, skip, hotel_code, from_date, to_date, user_id } = payload;

    const dtbs = this.db("hall_booking_view as hbv");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    const data = await dtbs.withSchema(this.RESERVATION_SCHEMA);

    const total_confimed_hall = await this.db("hall_booking_view as hbv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("hbv.id as total_confimed")
      .where("hbv.hotel_code", hotel_code)
      .andWhere({ booking_status: "confirmed" })
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (from_date && to_date) {
          this.andWhereBetween("hbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    const total_pending_hall = await this.db("hall_booking_view as hbv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("hbv.id as total_pending")
      .where("hbv.hotel_code", hotel_code)
      .andWhere({ booking_status: "pending" })
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (from_date && to_date) {
          this.andWhereBetween("hbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    const total_canceled_hall = await this.db("hall_booking_view as hbv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("hbv.id as total_canceled")
      .where("hbv.hotel_code", hotel_code)
      .andWhere({ booking_status: "canceled" })
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (from_date && to_date) {
          this.andWhereBetween("hbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    const totalAmount = await this.db("hall_booking_view as hbv")
      .count("hbv.id as total")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("hbv.grand_total as totalAmount")
      .where("hbv.hotel_code", hotel_code)
      .andWhere({ booking_status: "confirmed", pay_status: 1 })
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (from_date && to_date) {
          this.andWhereBetween("hbv.created_at", [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total_confimed_hall: total_confimed_hall[0].total_confimed,
      total_pending_hall: total_pending_hall[0].total_pending,
      total_canceled_hall: total_canceled_hall[0].total_canceled,
    };
  }

  // account report
  public async getAccountReport(payload: {
    from_date?: string;
    to_date?: string;
    hotel_code: number;
    ac_type: string;
  }) {
    const { ac_type, from_date, hotel_code, to_date } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const total = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("al.ledger_id as total")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total debit amount
    const totalDebitAmount = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_debit_amount as totalDebit")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total credit amount
    const totalCreditAmount = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_credit_amount as totalCredit")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    // total total Remainig balance
    const totalRemaining = await this.db("acc_ledger AS al")
      .withSchema(this.RESERVATION_SCHEMA)
      .sum("al.ledger_balance as totalRemaining")
      .leftJoin("account as ac", "al.ac_tr_ac_id", "ac.id")
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween("al.created_at", [from_date, endDate]);
        }
        this.andWhere("al.hotel_code", hotel_code);
        if (ac_type) {
          this.andWhere("ac.ac_type", ac_type);
        }
      });

    return {
      total: total[0].total,
      totalDebitAmount: totalDebitAmount[0].totalDebit | 0,
      totalCreditAmount: totalCreditAmount[0].totalCredit | 0,
      totalRemainingAmount: totalRemaining[0].totalRemaining | 0,
    };
  }

  // room report
  public async getRoomReport(payload: {
    from_date?: string;
    to_date: string;
    hotel_code: number;
  }) {
    const { from_date, to_date, hotel_code } = payload;

    // exact end date
    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    const dtbs = this.db("room_view as rv");

    const data = await dtbs.withSchema(this.RESERVATION_SCHEMA);

    // total room
    const total_room = await this.db("room_view as rv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rv.room_id as total_room")
      .where({ hotel_code })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rv.created_at", [from_date, endDatePlusOneDay]);
        }
      });

    // total super deluxe room
    const total_super_deluxe_room = await this.db("room_view as rv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rv.room_id as total_super_deluxe_room")
      .where({ hotel_code, room_type: "super-deluxe" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rv.created_at", [from_date, endDatePlusOneDay]);
        }
      });

    // total deluxe room
    const total_deluxe_room = await this.db("room_view as rv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rv.room_id as total_deluxe_room")
      .where({ hotel_code, room_type: "deluxe" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rv.created_at", [from_date, endDatePlusOneDay]);
        }
      });

    // total single room
    const total_single_room = await this.db("room_view as rv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rv.room_id as total_single_room")
      .where({ hotel_code, room_type: "single" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rv.created_at", [from_date, endDatePlusOneDay]);
        }
      });

    // total double room
    const total_double_room = await this.db("room_view as rv")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("rv.room_id as total_double_room")
      .where({ hotel_code, room_type: "double" })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("rv.created_at", [from_date, endDatePlusOneDay]);
        }
      });

    return {
      total_room: total_room[0].total_room,
      total_super_deluxe_room:
        total_super_deluxe_room[0].total_super_deluxe_room,
      total_deluxe_room: total_deluxe_room[0].total_deluxe_room,
      total_single_room: total_single_room[0].total_single_room,
      total_double_room: total_double_room[0].total_double_room,
    };
  }
}
export default DashBoardModel;
