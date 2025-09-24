import {
  ICreateAdditionBody,
  ICreatedeductionBody,
  ICreatePayrollBody,
  IPayrollList,
  ISinglePayroll,
  IUpdatePayrollBody,
} from "../../appAdmin/utlis/interfaces/payRoll.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class PayRollModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Check payroll
  public async hasPayrollForMonth({
    employee_id,
    hotel_code,
    payroll_month,
  }: {
    employee_id: number;
    hotel_code: number;
    payroll_month: string;
  }): Promise<boolean> {
    const result = await this.db("payroll as p")
      .withSchema(this.HR_SCHEMA)
      .count("p.id as total")
      .where("p.employee_id", employee_id)
      .andWhere("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .andWhereRaw(
        "TO_CHAR(p.payroll_month, 'YYYY-MM') = TO_CHAR(?::date, 'YYYY-MM')",
        [payroll_month]
      );

    return Number(result[0].total) > 0;
  }

  // Create PayRoll
  public async CreatePayRoll(payload: ICreatePayrollBody) {
    return await this.db("payroll")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  // Create employee deductions
  public async createEmployeeDeductions(payload: ICreatedeductionBody[]) {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  // Create employee allowance
  public async createEmployeeAllowances(payload: ICreateAdditionBody[]) {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  // Get All Pay Roll
  public async getAllPayRoll(payload: {
    from_date: string;
    to_date: string;
    limit?: string;
    skip?: string;
    key?: string;
    hotel_code: number;
  }): Promise<{ data: IPayrollList[]; total: number }> {
    const { key, hotel_code, limit, skip, from_date, to_date } = payload;

    const dtbs = this.db("payroll as p");

    const endDatePlusOneDay = new Date(to_date);
    endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HR_SCHEMA)
      .select(
        "p.id",
        "e.name as employee_name",
        "de.name as designation",
        this.db.raw(
          `(SELECT COALESCE(SUM(ea.allowance_amount), 0)
         FROM ${this.HR_SCHEMA}.employee_allowances ea
         WHERE p.id = ea.payroll_id) as total_allowance`
        ),
        this.db.raw(
          `(SELECT COALESCE(SUM(ed.deduction_amount), 0)
         FROM ${this.HR_SCHEMA}.employee_deductions ed
         WHERE p.id = ed.payroll_id) as total_deduction`
        ),
        "p.basic_salary",
        "p.payment_method",
        "p.gross_salary",
        "p.net_salary",
        "p.salary_date"
      )
      .leftJoin("employee as e", "e.id", "p.employee_id")
      .leftJoin("designation as de", "de.id", "e.designation_id")
      .where("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("p.salary_date", [from_date, to_date]);
        }
        if (key) {
          this.andWhere("e.name", "like", `%${key}%`).orWhere(
            "de.name",
            "like",
            `%${key}%`
          );
        }
      })
      .orderBy("p.id", "desc");

    const total = await this.db("payroll as p")
      .count("p.id as total")
      .withSchema(this.HR_SCHEMA)
      .leftJoin("employee as e", "e.id", "p.employee_id")
      .leftJoin("designation as de", "de.id", "e.designation_id")
      .where("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .andWhere(function () {
        if (from_date && to_date) {
          this.andWhereBetween("p.salary_date", [from_date, to_date]);
        }
        if (key) {
          this.andWhere("e.name", "like", `%${key}%`).orWhere(
            "de.name",
            "like",
            `%${key}%`
          );
        }
      });

    return { data, total: Number(total[0].total) };
  }

  // get single pay Roll
  public async getSinglePayRoll(
    id: number,
    hotel_code: number
  ): Promise<ISinglePayroll | null> {
    return await this.db("payroll as p")
      .withSchema(this.HR_SCHEMA)
      .select(
        "p.id",
        "h.name as hotel_name",
        "h.address as hotel_address",
        "h.country_code",
        "h.city_code",
        "h.postal_code",
        "e.id as employee_id",
        "e.name as employee_name",
        "des.name as employee_designation",
        "e.contact_no as employee_phone",
        this.db.raw(
          `(SELECT COALESCE(SUM(ea.allowance_amount), 0)
         FROM ${this.HR_SCHEMA}.employee_allowances ea
         WHERE p.id = ea.payroll_id) as total_allowance`
        ),
        this.db.raw(
          `(SELECT COALESCE(SUM(ed.deduction_amount), 0)
         FROM ${this.HR_SCHEMA}.employee_deductions ed
         WHERE p.id = ed.payroll_id) as total_deduction`
        ),
        "p.unpaid_leave_days",
        "p.leave_days",
        "p.account_id",
        "p.unpaid_leave_deduction",
        "p.payable_days",
        "p.daily_rate",
        "p.basic_salary",
        "p.payment_method",
        "p.gross_salary",
        "p.net_salary",
        "p.payroll_month",
        "p.salary_date",
        "p.note",
        "p.total_days",
        "p.granted_leave_days",
        "p.total_attendance_days",
        "p.docs",
        "p.created_by",
        "ua.name as created_by_name",
        "p.is_deleted"
      )
      .joinRaw(`JOIN ?? as h ON h.hotel_code = p.hotel_code`, [
        `${this.RESERVATION_SCHEMA}.${this.TABLES.hotels}`,
      ])
      .join("employee as e", "e.id", "p.employee_id")
      .join("designation as des", "des.id", "e.designation_id")
      .leftJoin("employee_deductions as ed", "ed.payroll_id", "p.id")
      .leftJoin("employee_allowances as ea", "ea.payroll_id", "p.id")
      .joinRaw(`JOIN ?? as ua ON ua.id = p.created_by`, [
        `${this.RESERVATION_SCHEMA}.${this.TABLES.user_admin}`,
      ])
      .where("p.id", id)
      .andWhere("p.hotel_code", hotel_code)
      .andWhere("p.is_deleted", false)
      .groupBy(
        "p.id",
        "h.hotel_code",
        "h.name",
        "h.address",
        "h.country_code",
        "h.city_code",
        "h.postal_code",
        "e.id",
        "e.name",
        "e.contact_no",
        "e.salary",
        "des.id",
        "des.name",
        "ua.name"
      )
      .select(
        this.db.raw(`
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', ed.id,
                            'deduction_name', ed.deduction_name,
                            'deduction_amount', ed.deduction_amount,
                            'is_deleted', ed.is_deleted
                        )
                    ) FILTER (WHERE ed.id IS NOT NULL AND ed.is_deleted = false), '[]'
                ) AS deductions
            `),
        this.db.raw(`
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', ea.id,
                            'allowance_name', ea.allowance_name,
                            'allowance_amount', ea.allowance_amount,
                            'is_deleted', ea.is_deleted
                        )
                    ) FILTER (WHERE ea.id IS NOT NULL AND ea.is_deleted = false), '[]'
                ) AS allowances
            `)
      )
      .first();
  }

  public async updatePayRoll({
    id,
    payload,
  }: {
    id: number;
    payload: Partial<IUpdatePayrollBody>;
  }) {
    return await this.db("payroll")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async deletePayRoll({
    id,
    payload,
  }: {
    id: number;
    payload: {
      is_deleted: boolean;
      deleted_by: number;
      deleted_at: string;
    };
  }) {
    return await this.db("payroll")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async updateEmployeeAllowances({
    id,
    payload,
  }: {
    id: number;
    payload: any;
  }) {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async updateEmployeeDeductions({
    id,
    payload,
  }: {
    id: number;
    payload: any;
  }) {
    console.log({ id, payload });
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .update(payload);
  }

  public async getEmployeeDeductionsByPayrollId(payroll_id: number) {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where({ payroll_id })
      .andWhere({ is_deleted: false });
  }

  public async getEmployeeDeductionsByIds({
    ids,
    payroll_id,
  }: {
    payroll_id: number;
    ids: number[];
  }): Promise<
    {
      id: number;
      employee_id: number;
      deduction_amount: number;
      deduction_name: string;
    }[]
  > {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where({ payroll_id })
      .where("id", ids);
  }

  public async getEmployeeAllowancesByPayrollId(payroll_id: number): Promise<
    {
      id: number;
      employee_id: number;
      allowance_name: string;
      allowance_amount: number;
      payroll_id: number;
    }[]
  > {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .select("id", "employee_id", "allowance_amount", "payroll_id")
      .where({ payroll_id })
      .andWhere({ is_deleted: false });
  }

  public async getEmployeeAllowancesByIds({
    payroll_id,
    ids,
  }: {
    payroll_id: number;
    ids: number[];
  }): Promise<
    {
      id: number;
      employee_id: number;
      allowance_amount: number;
      payroll_id: number;
    }[]
  > {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .whereIn("id", ids)
      .andWhere({ payroll_id });
  }

  public async deleteEmployeeDeductionsByIds({
    payroll_id,
    ids,
  }: {
    payroll_id: number;
    ids: number[];
  }) {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .where({ payroll_id })
      .whereIn("id", ids)
      .del();
  }

  public async deleteEmployeeAllowancesByIds({
    payroll_id,
    ids,
  }: {
    payroll_id: number;
    ids: number[];
  }) {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .where({ payroll_id })
      .whereIn("id", ids)
      .del();
  }

  public async getSingleEmployeeDeduction(id: number) {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("id", id)
      .first();
  }

  public async getSingleEmployeeAllowance(id: number) {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("id", id)
      .first();
  }
}
export default PayRollModel;
