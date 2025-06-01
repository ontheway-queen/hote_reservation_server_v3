import { idType } from '../../../appAdmin/utlis/interfaces/doubleEntry.interface';
import {
  AccountJournalTransactions,
  AccTransactionParams,
} from '../../../appAdmin/utlis/interfaces/report.interface';
import { TDB } from '../../../common/types/commontypes';
import Schema from '../../../utils/miscellaneous/schema';

class ReportModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Get All room
  public async getAllRoom(payload: {
    id?: number;
    hotel_code: number;
    key?: string;
    availability?: string;
    refundable?: string;
    occupancy?: string;
    limit?: string;
    skip?: string;
    adult?: string;
    child?: string;
    room_number: string;
    rooms?: number[];
  }) {
    const {
      key,
      availability,
      refundable,
      limit,
      skip,
      hotel_code,
      adult,
      child,
      rooms,
    } = payload;
    console.log({ hotel_code });
    const dtbs = this.db('room_view as rv');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs

      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'rv.room_id as id',
        'rv.room_number',
        'rv.room_type',
        'rv.bed_type',
        'rv.refundable',
        'rv.rate_per_night',
        'rv.discount',
        'rv.discount_percent',
        'rv.child',
        'rv.adult',
        'rv.occupancy',
        'rv.tax_percent',
        'rv.availability',
        'rv.room_description',
        'rv.room_amenities',
        'rv.room_images'
      )
      .where({ hotel_code })
      .andWhere(function () {
        if (key) {
          this.andWhere('rv.room_number', 'like', `%${key}%`)
            .orWhere('rv.room_type', 'like', `%${key}%`)
            .orWhere('rv.bed_type', 'like', `%${key}%`);
        }
      })
      .andWhere(function () {
        if (availability) {
          this.andWhere({ availability });
        }
        if (refundable) {
          this.andWhere({ refundable });
        }
        if (child) {
          this.andWhere({ child });
        }
        if (adult) {
          this.andWhere({ adult });
        }
        if (rooms) {
          this.whereIn('rv.room_id', rooms);
        }
      })
      .orderBy('rv.room_id', 'desc');

    const total = await this.db('room_view as rv')
      .withSchema(this.RESERVATION_SCHEMA)
      .count('rv.room_id as total')
      .where({ hotel_code })
      .andWhere(function () {
        if (key) {
          this.andWhere('rv.room_number', 'like', `%${key}%`)
            .orWhere('rv.room_type', 'like', `%${key}%`)
            .orWhere('rv.bed_type', 'like', `%${key}%`);
        }
      })
      .andWhere(function () {
        if (availability) {
          this.andWhere({ availability });
        }
        if (refundable) {
          this.andWhere({ refundable });
        }
        if (child) {
          this.andWhere({ child });
        }
        if (adult) {
          this.andWhere({ adult });
        }
        if (rooms) {
          this.whereIn('rv.room_id', rooms);
        }
      });

    return { data, total: total[0].total };
  }

  // Get all booking room
  public async getAllBookingRoom(payload: {
    hotel_code: number;
    key?: string;
    from_date?: any;
    to_date?: any;
    availability?: string;
    refundable?: string;
    limit?: string;
    skip?: string;
    occupancy?: string;
    rooms?: number[];
  }) {
    const { limit, skip, hotel_code, to_date, from_date } = payload;

    const dtbs = this.db('room_booking_view');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    return await dtbs
      .select(
        'id',
        'hotel_code',
        'check_in_time',
        'check_out_time',
        'name',
        'email',
        'grand_total',
        'due',
        'user_last_balance',
        'booking_rooms'
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where((qb) => {
        qb.andWhere({ hotel_code });
        qb.andWhere({ reserved_room: 1 });
        qb.andWhereNot({ status: 'left' });
        if (from_date && to_date) {
          qb.andWhereBetween('check_in_time', [from_date, to_date]);
        }
      });
  }

  // get all booking room second query avaibility with checkout
  public async getAllBookingRoomForSdQueryAvailblityWithCheckout(payload: {
    hotel_code: number;
    key?: string;
    from_date?: any;
    to_date?: any;
    availability?: string;
    refundable?: string;
    limit?: string;
    skip?: string;
    occupancy?: string;
    rooms?: number[];
  }) {
    const { limit, skip, hotel_code, to_date, from_date } = payload;

    const dtbs = this.db('room_booking_view');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    return await dtbs
      .select(
        'id',
        'hotel_code',
        'check_in_time',
        'check_out_time',
        'name',
        'email',
        'grand_total',
        'due',
        'user_last_balance',
        'booking_rooms'
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where((qb) => {
        qb.andWhere({ hotel_code });
        qb.andWhere({ reserved_room: 1 });
        qb.andWhereNot({ status: 'left' });
        if (from_date && to_date) {
          qb.andWhere('check_out_time', '>=', to_date).andWhere(
            'check_in_time',
            '<=',
            from_date
          );
        }
      });
  }

  // Get all booking room for room report
  public async getBookingRoomReport(payload: {
    hotel_code: number;
    key?: string;
    from_date?: string;
    to_date?: string;
    availability?: string;
    refundable?: string;
    limit?: string;
    skip?: string;
    occupancy?: string;
    rooms?: number[];
  }) {
    const { limit, skip, hotel_code, to_date, from_date } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('room_booking_view');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const bookingData = await dtbs
      .select(
        'id',
        'hotel_code',
        'check_in_time',
        'check_out_time',
        'booking_rooms'
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ hotel_code })
      .andWhere({ reserved_room: 1 })
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('check_in_time', [from_date, endDate]);
        }
      })
      .andWhereNot({ status: 'left' });

    return {
      success: true,
      bookingData,
    };
  }
  // ------------------------------------------------------------------------------
  // room booking report
  public async getRoomBookingReport(payload: {
    limit?: string;
    skip?: string;
    pay_status: string;
    check_in_out_status?: string;
    room_id?: string;
    from_date?: string;
    to_date?: string;
    hotel_code: number;
  }) {
    const {
      limit,
      skip,
      hotel_code,
      from_date,
      to_date,
      check_in_out_status,
      room_id,
      pay_status,
    } = payload;

    const dtbs = this.db('room_booking_view as rbv');

    if (limit && skip) {
      dtbs.limit(parseInt(limit));
      dtbs.offset(parseInt(skip));
    }

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate());

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'rbv.id',
        'br.room_id',
        'hr.room_number',
        'rbv.name',
        'rbv.email',
        'rbv.phone',
        'rbv.check_in_time',
        'rbv.check_out_time',
        'rbv.number_of_nights',
        'rbv.total_occupancy',
        'rbv.extra_charge',
        'rbv.grand_total',
        'rbv.pay_status',
        'rbv.no_payment',
        'rbv.partial_payment',
        'rbv.full_payment',
        'rbv.reserved_room',
        'rbv.status',
        'rbv.check_in_out_status'
      )
      .where('hr.hotel_code', hotel_code)
      .leftJoin('booking_rooms as br', 'rbv.id', 'br.booking_id')
      .leftJoin('hotel_room as hr', 'br.room_id', 'hr.id')
      .leftJoin('booking_check_in_out as bcio', 'rbv.id', 'bcio.booking_id')
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('rbv.check_in_time', [from_date, endDate]);
        }
        if (room_id) {
          this.andWhere('hr.id', room_id);
        }
        if (check_in_out_status) {
          this.andWhere('rbv.check_in_out_status', check_in_out_status);
        }
        if (pay_status) {
          this.andWhere('rbv.pay_status', pay_status);
        }
      })
      .orderBy('rbv.id', 'desc');

    const total = await this.db('room_booking_view as rbv')
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin('booking_rooms as br', 'rbv.id', 'br.booking_id')
      .leftJoin('hotel_room as hr', 'br.room_id', 'hr.id')
      .leftJoin('booking_check_in_out as bcio', 'rbv.id', 'bcio.booking_id')
      .count('rbv.id as total')
      .where('hr.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('rbv.check_in_time', [from_date, endDate]);
        }
        if (room_id) {
          this.andWhere('hr.id', room_id);
        }
        if (check_in_out_status) {
          this.andWhere('rbv.check_in_out_status', check_in_out_status);
        }
        if (pay_status) {
          this.andWhere('rbv.pay_status', pay_status);
        }
      });

    const totalAmount = await this.db('room_booking_view as rbv')
      .count('rbv.id as total')
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin('booking_rooms as br', 'rbv.id', 'br.booking_id')
      .leftJoin('hotel_room as hr', 'br.room_id', 'hr.id')
      .leftJoin('booking_check_in_out as bcio', 'rbv.id', 'bcio.booking_id')
      .sum('rbv.grand_total as totalAmount')
      .where('hr.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('rbv.check_in_time', [from_date, endDate]);
        }
        if (room_id) {
          this.andWhere('hr.id', room_id);
        }
        if (check_in_out_status) {
          this.andWhere('rbv.check_in_out_status', check_in_out_status);
        }
        if (pay_status) {
          this.andWhere('rbv.pay_status', pay_status);
        }
      });

    const totalGuest = await this.db('room_booking_view as rbv')
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin('booking_rooms as br', 'rbv.id', 'br.booking_id')
      .leftJoin('hotel_room as hr', 'br.room_id', 'hr.id')
      .leftJoin('booking_check_in_out as bcio', 'rbv.id', 'bcio.booking_id')
      .sum('rbv.total_occupancy as totalGuest')
      .where('hr.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('check_in_time', [from_date, endDate]);
        }
        if (room_id) {
          this.andWhere('hr.id', room_id);
        }
        if (check_in_out_status) {
          this.andWhere('rbv.check_in_out_status', check_in_out_status);
        }
        if (pay_status) {
          this.andWhere('rbv.pay_status', pay_status);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0]?.totalAmount || 0,
      totalGuest: totalGuest[0].totalGuest || 0,
      total: total[0]?.total || 0,
    };
  }

  // account report
  public async getAccountReport(payload: {
    from_date: string;
    to_date: string;
    hotel_code: number;
    name: string;
    limit: string;
    skip: string;
  }) {
    const { name, from_date, hotel_code, to_date, limit, skip } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('acc_ledger AS al');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'al.ledger_id',
        'ac.name as account_name',
        'ac.bank',
        'ac.details',
        'al.ledger_debit_amount',
        'al.ledger_credit_amount',
        'al.ledger_balance',
        'al.created_at'
      )
      .leftJoin('account as ac', 'al.ac_tr_ac_id', 'ac.id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('al.created_at', [from_date, endDate]);
        }
        if (name) {
          this.andWhere('ac.name', name);
        }
        this.andWhere('al.hotel_code', hotel_code);
      })
      .orderBy('al.ledger_id', 'desc');

    const total = await this.db('acc_ledger AS al')
      .withSchema(this.RESERVATION_SCHEMA)
      .count('al.ledger_id as total')
      .leftJoin('account as ac', 'al.ac_tr_ac_id', 'ac.id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('al.created_at', [from_date, endDate]);
        }
        if (name) {
          this.andWhere('ac.name', name);
        }
        this.andWhere('al.hotel_code', hotel_code);
      });

    // total debit amount

    const totalDebitAmount = await this.db('acc_ledger AS al')
      .withSchema(this.RESERVATION_SCHEMA)
      .sum('al.ledger_debit_amount as totalDebit')
      .leftJoin('account as ac', 'al.ac_tr_ac_id', 'ac.id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('al.created_at', [from_date, endDate]);
        }
        if (name) {
          this.andWhere('ac.name', name);
        }
        this.andWhere('al.hotel_code', hotel_code);
      });

    // total credit amount
    const totalCreditAmount = await this.db('acc_ledger AS al')
      .withSchema(this.RESERVATION_SCHEMA)
      .sum('al.ledger_credit_amount as totalCredit')
      .leftJoin('account as ac', 'al.ac_tr_ac_id', 'ac.id')
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('al.created_at', [from_date, endDate]);
        }
        if (name) {
          this.andWhere('ac.name', name);
        }
        this.andWhere('al.hotel_code', hotel_code);
      });

    return {
      data,
      total: total[0].total,
      totalDebitAmount: totalDebitAmount[0].totalDebit,
      totalCreditAmount: totalCreditAmount[0].totalCredit,
    };
  }

  // Expense Report
  public async getExpenseReport(payload: {
    from_date?: string;
    to_date: string;
    limit?: string;
    skip?: string;
    key?: string;
    hotel_code: number;
  }) {
    const { limit, skip, hotel_code, from_date, to_date, key } = payload;

    const endDate = new Date(to_date as string);
    endDate.setDate(endDate.getDate() + 1);

    const dtbs = this.db('expense as e');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'e.expense_date as expense_date',
        'e.voucher_no',
        'ei.name as expense_head',
        'e.name as expense_name',
        'a.name as account_name',
        'a.ac_type',
        'ei.amount as expense_amount',
        'ua.name as created_by',
        'e.created_at'
      )

      .leftJoin('expense_item as ei', 'e.id', 'ei.expense_id')
      .leftJoin('account as a', 'e.ac_tr_ac_id', 'a.id')
      .leftJoin('user_admin as ua', 'e.created_by', 'ua.id')
      .where('e.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('e.created_at', [from_date, endDate]);
        }
        if (key) {
          this.andWhere((builder) => {
            builder.where('ei.name', 'like', `%${key}%`);
          });
        }
      })
      .orderBy('ei.id', 'desc');

    const total = await this.db('expense as e')
      .withSchema(this.RESERVATION_SCHEMA)
      .countDistinct('ei.id as total')
      .leftJoin('expense_item as ei', 'e.id', 'ei.expense_id')
      .leftJoin('account as a', 'e.ac_tr_ac_id', 'a.id')
      .leftJoin('user_admin as ua', 'e.created_by', 'ua.id')
      .where('e.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('e.created_at', [from_date, endDate]);
        }
        if (key) {
          this.andWhere((builder) => {
            builder.where('ei.name', 'like', `%${key}%`);
          });
        }
      })
      .first();

    // total amount
    const totalAmount = await this.db('expense as e')
      .withSchema(this.RESERVATION_SCHEMA)
      .sum('ei.amount as totalAmount')
      .leftJoin('expense_item as ei', 'e.id', 'ei.expense_id')
      .leftJoin('account as a', 'e.ac_tr_ac_id', 'a.id')
      .leftJoin('user_admin as ua', 'e.created_by', 'ua.id')
      .where('e.hotel_code', hotel_code)
      .where(function () {
        if (from_date && to_date) {
          this.andWhereBetween('e.created_at', [from_date, endDate]);
        }
        if (key) {
          this.andWhere('ei.name', 'like', `%${key}%`);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total: total?.total,
    };
  }

  // Get Salary Report
  public async getSalaryReport(payload: {
    from_date: string;
    to_date: string;
    limit?: string;
    skip?: string;
    key?: string;

    hotel_code: number;
  }) {
    const { key, hotel_code, limit, skip, from_date, to_date } = payload;
    const dtbs = this.db('payroll as p');

    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .select(
        'p.id',
        'p.salary_date',
        'e.name as employee_name',
        'de.name as designation',
        'a.name as account_name',
        'e.salary as basic_salary',
        'p.gross_salary as Other_Allowance',
        'p.total_salary as Net_Amount',
        'p.note'
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin('employee as e', 'e.id', 'p.employee_id')
      .leftJoin('designation as de', 'de.id', 'e.designation_id')
      .leftJoin('account as a', 'a.id', 'p.ac_tr_ac_id')
      .where('p.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.salary_date', [from_date, to_date]);
        }
        if (key) {
          this.andWhere('e.name', 'like', `%${key}%`);
        }
      })
      .orderBy('p.id', 'desc');

    const total = await this.db('payroll as p')
      .count('p.id as total')
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin('employee as e', 'e.id', 'p.employee_id')
      .leftJoin('designation as de', 'de.id', 'e.designation_id')
      .leftJoin('account as a', 'a.id', 'p.ac_tr_ac_id')
      .where('p.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.salary_date', [from_date, to_date]);
        }
        if (key) {
          this.andWhere('e.name', 'like', `%${key}%`);
        }
      })
      .first();

    const totalAmount = await this.db('payroll as p')
      .count('p.id as total')
      .withSchema(this.RESERVATION_SCHEMA)
      .sum('p.total_salary as totalAmount')
      .leftJoin('employee as e', 'e.id', 'p.employee_id')
      .leftJoin('designation as de', 'de.id', 'e.designation_id')
      .leftJoin('account as a', 'a.id', 'p.ac_tr_ac_id')
      .where('p.hotel_code', hotel_code)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween('p.salary_date', [from_date, to_date]);
        }
        if (key) {
          this.andWhere('e.name', 'like', `%${key}%`);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total: total?.total,
    };
  }

  // get all hall report
  public async getHallBookingReport(payload: {
    limit?: string;
    skip?: string;
    from_date: string;
    to_date: string;
    hotel_code: number;
    check_in_out_status?: string;
    user_id?: string;
  }) {
    const {
      limit,
      skip,
      hotel_code,
      check_in_out_status,
      from_date,
      to_date,
      user_id,
    } = payload;

    const dtbs = this.db('hall_booking_view as hbv');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'hbv.id',
        'hbv.booking_no',
        'hbv.name as client_name',
        'hbv.email as client_mail',
        'hbv.phone',
        'hbv.event_date',
        'hbv.start_time',
        'hbv.end_time',
        'hbv.number_of_hours',
        'hbv.total_occupancy',
        'hbv.no_payment',
        'hbv.partial_payment',
        'hbv.full_payment',
        'hbv.grand_total',
        'hbv.booking_status',
        'hbv.booking_date',
        'hbv.check_in_out_status'
      )
      .where('hbv.hotel_code', hotel_code)
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (check_in_out_status) {
          this.andWhere({ check_in_out_status });
        }
        if (from_date && to_date) {
          this.andWhereBetween('hbv.created_at', [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      })
      .orderBy('hbv.id', 'desc');

    const total = await this.db('hall_booking_view as hbv')
      .withSchema(this.RESERVATION_SCHEMA)
      .count('hbv.id as total')
      .where('hbv.hotel_code', hotel_code)
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (check_in_out_status) {
          this.andWhere({ check_in_out_status });
        }
        if (from_date && to_date) {
          this.andWhereBetween('hbv.created_at', [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    const totalAmount = await this.db('hall_booking_view as hbv')
      .count('hbv.id as total')
      .withSchema(this.RESERVATION_SCHEMA)
      .sum('hbv.grand_total as totalAmount')
      .where({ hotel_code })
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (check_in_out_status) {
          this.andWhere({ check_in_out_status });
        }
        if (from_date && to_date) {
          this.andWhereBetween('hbv.created_at', [
            from_date,
            endDatePlusOneDay,
          ]);
        }
      });

    return {
      data,
      totalAmount: totalAmount[0].totalAmount,
      total: total[0].total,
    };
  }

  // get client ledger Report
  public async getClientLedgerReport(payload: {
    limit?: string;
    skip?: string;
    from_date: string;
    to_date: string;
    hotel_code: number;
    pay_type?: string;
    user_id?: string;
  }) {
    const { limit, skip, hotel_code, pay_type, from_date, to_date, user_id } =
      payload;

    const dtbs = this.db('user_ledger as ul');

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    const data = await dtbs
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'ul.id',
        'ul.hotel_code',
        'ul.name',
        'u.name as user_name',
        'ul.pay_type',
        'ul.amount',
        'ul.last_balance',
        'ul.created_at'
      )
      .where('ul.hotel_code', hotel_code)
      .leftJoin('user as u', 'ul.user_id', 'u.id')
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (pay_type) {
          this.andWhere({ pay_type });
        }
        if (from_date && to_date) {
          this.andWhereBetween('ul.created_at', [from_date, endDatePlusOneDay]);
        }
      })
      .orderBy('ul.id', 'asc');

    const total = await this.db('user_ledger as ul')
      .withSchema(this.RESERVATION_SCHEMA)
      .count('ul.id as total')
      .where('ul.hotel_code', hotel_code)
      .andWhere(function () {
        if (user_id) {
          this.andWhere({ user_id });
        }
        if (pay_type) {
          this.andWhere({ pay_type });
        }
        if (from_date && to_date) {
          this.andWhereBetween('ul.created_at', [from_date, endDatePlusOneDay]);
        }
      });

    // const totalDebitAmount = await this.db("user_ledger as ul")
    //   .count("ul.id as total")
    //   .withSchema(this.RESERVATION_SCHEMA)
    //   .sum("ul.amount as totalAmount")
    //   .where({ hotel_code, pay_type: "debit" })
    //   .andWhere(function () {
    //     if (user_id) {
    //       this.andWhere({ user_id });
    //     }
    //     if (pay_type) {
    //       this.andWhere({ pay_type });
    //     }
    //     if (from_date && to_date) {
    //       this.andWhereBetween("ul.created_at", [from_date, endDatePlusOneDay]);
    //     }
    //   });

    // const totalCreditAmount = await this.db("user_ledger as ul")
    //   .count("ul.id as total")
    //   .withSchema(this.RESERVATION_SCHEMA)
    //   .sum("ul.amount as totalAmount")
    //   .where({ hotel_code, pay_type: "credit" })
    //   .andWhere(function () {
    //     if (user_id) {
    //       this.andWhere({ user_id });
    //     }
    //     if (pay_type) {
    //       this.andWhere({ pay_type });
    //     }
    //     if (from_date && to_date) {
    //       this.andWhereBetween("ul.created_at", [from_date, endDatePlusOneDay]);
    //     }
    //   });

    // const [debitResult] = await totalDebitAmount;
    // const totalDebit = parseInt(debitResult.totalAmount) || 0;

    // const [creditResult] = await totalCreditAmount;
    // const totalCredit = parseInt(creditResult.totalAmount) || 0;

    // const totalAmount = totalDebit - totalCredit;

    return {
      data,
      // totalAmount: totalAmount,
      total: total[0].total,
    };
  }

  //<sabbir.m360ict@gmail.com> ---- Sabbir Hosen;
  // Account Reports

  public async getAccountsTransactions({
    headIds,
    from_date,
    to_date,
  }: AccTransactionParams): Promise<AccountJournalTransactions[]> {
    return await this.db('acc_vouchers AS av')
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'av.id',
        'av.acc_head_id',
        'av.voucher_no',
        'av.voucher_date',
        'av.voucher_type',
        'av.description',
        'av.debit',
        'av.credit',
        'ah.code AS acc_head_code',
        'ah.name AS acc_head_name',
        'ah.parent_id',
        'aph.name AS parent_acc_head_name',
        'ua.name AS created_by',
        'av.created_at'
      )
      .leftJoin('acc_heads AS ah', 'av.acc_head_id', 'ah.id')
      .leftJoin('acc_heads as aph', { 'aph.id': 'ah.parent_id' })
      .leftJoin('user_admin AS ua', 'av.created_by', 'ua.id')
      .where('av.is_deleted', false)
      .andWhere((qb) => {
        if (Array.isArray(headIds) && headIds.length) {
          qb.whereIn('av.acc_head_id', headIds);
        }

        if (from_date && to_date) {
          qb.andWhereRaw('Date(av.voucher_date) BETWEEN ? AND ?', [
            from_date,
            to_date,
          ]);
        }
      });
  }

  public async getAccHeadInfo(head_id: idType) {
    return await this.db('acc_heads AS ah')
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'ah.id',
        'ah.parent_id',
        'ah.code',
        'ah.group_code',
        'ah.name',
        'ah.hotel_code'
      )
      .where('id', head_id)
      .first();
  }

  public async getAccHeads() {
    return (await this.db('acc_heads AS ah')
      .withSchema(this.RESERVATION_SCHEMA)
      .select('ah.id', 'ah.name', 'ah.parent_id')) as {
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
    let subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from hotel_reservation.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as debit`;
    let subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from hotel_reservation.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false) as credit`;
    if (from_date && to_date) {
      subQueryDebit = `(SELECT SUM(COALESCE(av.debit, 0)) from hotel_reservation.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as debit`;
      subQueryCredit = `(SELECT SUM(COALESCE(av.credit, 0)) from hotel_reservation.acc_vouchers AS av where av.acc_head_id = ah.id and av.is_deleted = false and av.voucher_date between '${from_date}' and '${to_date}') as credit`;
    }

    return await this.db('acc_heads AS ah')
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        'ah.id',
        'ah.parent_id',
        'ah.code',
        'ah.group_code',
        'ah.name',
        'ag.name AS group_name',
        this.db.raw(subQueryDebit),
        this.db.raw(subQueryCredit)
      )
      .leftJoin('acc_groups AS ag', { 'ag.code': 'ah.group_code' })
      .where((qb) => {
        if (group_code) {
          qb.andWhere('ah.group_code', group_code);
        }
      });
  }
}
export default ReportModel;
