import {
  IAllowance,
  IcreateEmployee,
  IDeduction,
  IEmployeeListResponse,
  IEmployeeResponse,
  IShift,
  IupdateEmployee,
} from "../../appAdmin/utlis/interfaces/hr.interface";
import {
  ICreatedepartment,
  ICreatedesignation,
  ICreatePayrollMonths,
  IUpdatedepartment,
  IUpdatedesignation,
  IUpdatePayrollMonths,
} from "../../appAdmin/utlis/interfaces/setting.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class HrModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createDesignation(payload: ICreatedesignation) {
    return await this.db("designation")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  public async getAllDesignation(payload: {
    limit?: string;
    skip?: string;
    name: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
  }) {
    const { limit, skip, hotel_code, name, status, excludeId } = payload;

    const dtbs = this.db("designation as de");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HR_SCHEMA)
      .select(
        "de.id",
        "de.hotel_code",
        "de.name as designation_name",
        "de.status",
        "de.is_deleted",
        "de.created_by as created_by_id",
        "ua.name as created_by_name"
      )

      .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = de.created_by`, [
        this.RESERVATION_SCHEMA,
      ])
      .where(function () {
        this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
      })
      .andWhere("de.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhere("de.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("de.status", status);
        }
        if (excludeId) {
          this.andWhere("de.id", "!=", excludeId);
        }
      })
      .orderBy("de.id", "desc");

    const total = await this.db("designation as de")
      .withSchema(this.HR_SCHEMA)
      .count("de.id as total")
      .where(function () {
        this.whereNull("de.hotel_code").orWhere("de.hotel_code", hotel_code);
      })
      .andWhere("de.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhere("de.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("de.status", status);
        }
        if (excludeId) {
          this.andWhere("de.id", "!=", excludeId);
        }
      });

    return { total: total[0].total, data };
  }

  public async updateDesignation(
    id: number,
    hotel_code: number,
    payload: IUpdatedesignation
  ) {
    return await this.db("designation")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async deleteDesignation(id: number, hotel_code: number) {
    return await this.db("designation")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  public async createPayrollMonths(payload: ICreatePayrollMonths) {
    return await this.db("payroll_months")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  public async getPayrollMonths(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    month_id?: number;
    hotel_code: number;
  }) {
    const { limit, skip, hotel_code, name, month_id } = payload;
    let dtbs = this.db("payroll_months as pm").withSchema(this.HR_SCHEMA);

    if (limit && skip) {
      dtbs = dtbs.limit(parseInt(limit));
      dtbs = dtbs.offset(parseInt(skip));
    }

    const data = await dtbs
      .select(
        "pm.id",
        "months.name as month_name",
        "pm.days as working_days",
        "pm.hours",
        "pm.is_deleted"
      )
      .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
        `${this.DBO_SCHEMA}.${this.TABLES.months}`,
      ])
      .where("pm.hotel_code", hotel_code)
      .andWhere("pm.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
        }
        if (month_id) {
          this.andWhere("months.id", month_id);
        }
      })
      .orderBy("pm.id", "asc");

    // New query builder for count
    let countQuery = this.db("payroll_months as pm").withSchema(this.HR_SCHEMA);

    const totalResult = await countQuery
      .count("pm.id as total")
      .joinRaw(`JOIN ?? as months ON months.id = pm.month_id`, [
        `${this.DBO_SCHEMA}.${this.TABLES.months}`,
      ])
      .where("pm.hotel_code", hotel_code)
      .andWhere("pm.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhereRaw("months.name::text ILIKE ?", [`%${name}%`]);
        }
        if (month_id) {
          this.andWhere("months.id", month_id);
        }
      });

    const total = totalResult[0].total;

    return { total, data };
  }

  public async updatePayrollMonths(id: number, payload: IUpdatePayrollMonths) {
    return await this.db("payroll_months")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .andWhere("is_deleted", false)
      .update(payload);
  }

  public async deletePayrollMonths(id: number) {
    return await this.db("payroll_months")
      .withSchema(this.HR_SCHEMA)
      .where({ id })
      .andWhere("is_deleted", false)
      .update({ is_deleted: true });
  }

  public async createDepartment(payload: ICreatedepartment) {
    return await this.db("department")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  public async getAllDepartment(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    status?: string;
    hotel_code: number;
    excludeId?: number;
    ids?: number[];
  }) {
    const { limit, skip, hotel_code, name, status, excludeId, ids } = payload;

    const dtbs = this.db("department as d");

    if (limit && skip) {
      dtbs.limit(parseInt(limit as string));
      dtbs.offset(parseInt(skip as string));
    }

    const data = await dtbs
      .withSchema(this.HR_SCHEMA)
      .select(
        "d.id",
        "d.hotel_code",
        "d.name as department_name",
        "d.status",
        "d.is_deleted",
        "d.created_by as created_by_id",
        "ua.name as created_by_name"
      )

      .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = d.created_by`, [
        this.RESERVATION_SCHEMA,
      ])
      .where("d.hotel_code", hotel_code)
      .andWhere("d.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhere("d.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("d.status", status);
        }
        if (excludeId) {
          this.andWhere("d.id", "!=", excludeId);
        }
        if (ids?.length) {
          this.whereIn("d.id", ids);
        }
      })
      .orderBy("d.id", "desc");

    const total = await this.db("department as d")
      .withSchema(this.HR_SCHEMA)
      .count("d.id as total")
      .where(function () {
        this.whereNull("d.hotel_code").orWhere("d.hotel_code", hotel_code);
      })
      .andWhere("d.is_deleted", false)
      .andWhere(function () {
        if (name) {
          this.andWhere("d.name", "ilike", `%${name}%`);
        }
        if (status) {
          this.andWhere("d.status", status);
        }
        if (excludeId) {
          this.andWhere("d.id", "!=", excludeId);
        }
        if (ids?.length) {
          this.whereIn("d.id", ids);
        }
      });

    return { total: Number(total[0].total), data };
  }

  public async getSingleDepartment(id: number, hotel_code: number) {
    return await this.db("department as d")
      .withSchema(this.HR_SCHEMA)
      .select(
        "d.id",
        "d.hotel_code",
        "d.name",
        "d.status",
        "d.is_deleted",
        "ua.id as created_by_id",
        "ua.name as created_by_name"
      )
      .joinRaw(`LEFT JOIN ??.user_admin as ua ON ua.id = d.created_by`, [
        this.RESERVATION_SCHEMA,
      ])
      .where("d.id", id)
      .andWhere("d.hotel_code", hotel_code)
      .andWhere("d.is_deleted", false)
      .first();
  }

  public async updateDepartment(
    id: number,
    hotel_code: number,
    payload: IUpdatedepartment
  ) {
    return await this.db("department")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async deleteDepartment(id: number, hotel_code: number) {
    return await this.db("department")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  public async insertEmployee(payload: IcreateEmployee) {
    return await this.db("employee")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  public async insertIntoEmpDepartment(
    payload: { department_id: number; emp_id: number }[]
  ) {
    console.log(payload);
    return await this.db("emp_departments")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  public async hasEmpDepartmentAlreadyExist(
    emp_id: number,
    ids: number[]
  ): Promise<{ department_id: number }[]> {
    return await this.db("emp_departments")
      .withSchema(this.HR_SCHEMA)
      .select("department_id")
      .whereIn("department_id", ids)
      .andWhere({ emp_id });
  }

  public async removeDepartmentFromEmployee(
    emp_id: number,
    removeIds: number[]
  ) {
    return await this.db("emp_departments")
      .withSchema(this.HR_SCHEMA)
      .del()
      .whereIn("department_id", removeIds)
      .where("emp_id", emp_id);
  }

  public async getAllEmployee(payload: {
    limit?: string;
    skip?: string;
    key?: string;
    hotel_code: number;
    department?: string;
    designation?: string;
  }): Promise<{ data: IEmployeeListResponse[]; total: number }> {
    const { key, hotel_code, limit, skip, department, designation } = payload;
    const dtbs = this.db("employee as e");

    if (limit && skip) {
      dtbs.limit(parseInt(limit));
      dtbs.offset(parseInt(skip));
    }

    const data = await dtbs
      .select(
        "e.id",
        "e.name",
        "e.email",
        "e.contact_no",
        "e.salary",
        "e.joining_date",
        "e.status"
      )
      .withSchema(this.HR_SCHEMA)
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.hotel_code", hotel_code)
      .andWhere("e.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.where("e.name", "like", `%${key}%`).orWhere(
            "e.email",
            "like",
            `%${key}%`
          );
        }
      })
      .andWhere(function () {
        if (designation) {
          this.where("de.name", "like", `%${designation}%`);
        }
      })
      .orderBy("e.id", "desc");

    const total = await this.db("employee as e")
      .withSchema(this.HR_SCHEMA)
      .count("e.id as total")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.hotel_code", hotel_code)
      .andWhere("e.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.where("e.name", "like", `%${key}%`).orWhere(
            "e.email",
            "like",
            `%${key}%`
          );
        }
      })
      .andWhere(function () {
        if (designation) {
          this.where("de.name", "like", `%${designation}%`);
        }
      });

    return {
      data,
      total: Number(total[0].total),
    };
  }

  public async getSingleEmployee(
    id: number,
    hotel_code: number
  ): Promise<IEmployeeResponse | null> {
    const data = await this.db("employee as e")
      .withSchema(this.HR_SCHEMA)
      .select(
        "e.id",
        "e.name",
        "e.email",
        "e.mobile_no",
        "e.photo",
        "e.blood_group as blood_group_id",
        "bg.name as blood_group_name",
        "dep.id as department_id",
        "dep.name as department_name",
        "des.id as designation_id",
        "des.name as designation_name",
        "e.salary",
        this.db.raw("to_char(e.dob, 'YYYY-MM-DD') as dob"),
        this.db.raw(
          "to_char(e.appointment_date, 'YYYY-MM-DD') as appointment_date"
        ),
        this.db.raw("to_char(e.joining_date, 'YYYY-MM-DD') as joining_date"),
        "e.hotel_code",
        "h.name as hotel_name",
        "ua.id as created_by_id",
        "ua.name as created_by_name",
        "e.address",
        "e.status",
        "e.created_at",
        "e.is_deleted"
      )
      .join("hotels as h", "h.hotel_code", "e.hotel_code")
      .join("department as dep", "e.department_id", "dep.id")
      .join("designation as des", "des.id", "e.designation_id")
      .join("user_admin as ua", "ua.id", "e.created_by")
      .joinRaw(`JOIN ?? as bg ON bg.id = e.blood_group`, [
        `${this.DBO_SCHEMA}.${this.TABLES.blood_group}`,
      ])
      .where("e.id", id)
      .andWhere("e.is_deleted", false)
      .andWhere("e.hotel_code", hotel_code)
      .first();

    return data ? data : null;
  }

  public async updateEmployee(id: number, payload: Partial<IupdateEmployee>) {
    console.log({ payload });
    return await this.db("employee")
      .withSchema(this.HR_SCHEMA)
      .where({ id, is_deleted: false })
      .update(payload);
  }

  public async deleteEmployee(id: number) {
    return await this.db("employee")
      .withSchema(this.HR_SCHEMA)
      .where({ id, is_deleted: false })
      .update({ is_deleted: true });
  }

  public async getEmployeesByDepartmentId({
    id,
    limit,
    skip,
  }: {
    id: number;
    limit: number;
    skip: number;
  }): Promise<{ data: IEmployeeListResponse[]; total: number }> {
    const dtbs = this.db("employee as e");

    if (limit && skip) {
      dtbs.limit(limit);
      dtbs.offset(skip);
    }
    const data = await dtbs
      .select(
        "e.id",
        "e.name",
        "e.email",
        "e.mobile_no",
        "d.name as department",
        "de.name as designation",
        "e.salary",
        "e.joining_date",
        "e.status"
      )
      .withSchema(this.HR_SCHEMA)
      .leftJoin("department as d", "e.department_id", "d.id")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.department_id", id)
      .andWhere("e.is_deleted", false)
      .orderBy("e.id", "desc");

    const total = await this.db("employee as e")
      .withSchema(this.HR_SCHEMA)
      .count("e.id as total")
      .leftJoin("department as d", "e.department_id", "d.id")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.department_id", id)
      .andWhere("e.is_deleted", false);

    return {
      total: Number(total[0].total),
      data,
    };
  }

  public async insertIntoEmpbankInfo(payload: {
    bank_name?: string;
    beneficiary_name?: string;
    acc_no?: string;
    branch_name?: string;
    routing_no?: string;
    swift_code?: string;
    emp_id: number;
  }) {
    console.log({ payload });
    return await this.db("emp_bank_info")
      .withSchema(this.HR_SCHEMA)
      .insert(payload);
  }

  // --------------------------- Shift --------------------------- //
  public async createShift(payload: {
    name: string;
    start_time: string;
    end_time: string;
    hotel_code: number;
  }) {
    return await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllShifts(query: {
    name?: string;
    hotel_code: number;
    limit?: number;
    skip?: number;
  }): Promise<{ data: IShift[]; total: number }> {
    const { name, hotel_code, limit, skip } = query;
    console.log({ name });
    const data = await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .orderBy("start_time", "asc")
      .limit(limit || 10)
      .offset(skip || 0);

    const totalQuery = await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .first();

    return {
      total: ((totalQuery && totalQuery.total) as number) || 0,
      data,
    };
  }

  public async getSingleShift(query: {
    id: number;
    hotel_code: number;
  }): Promise<IShift> {
    return await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .andWhere("is_deleted", false)
      .first();
  }

  public async updateShift({
    id,
    hotel_code,
    payload,
  }: {
    id: number;
    hotel_code: number;
    payload: {
      name?: string;
      start_time?: string;
      end_time?: string;
    };
  }) {
    return await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async deleteShift({
    id,
    hotel_code,
  }: {
    id: number;
    hotel_code: number;
  }) {
    return await this.db("shifts")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  // --------------------------- Allowances --------------------------- //
  public async createAllowances(payload: {
    name: string;
    type: string;
    value: number;
    is_taxable: number;
  }) {
    return await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllAllowances(query: {
    name?: string;
    hotel_code: number;
    limit?: number;
    skip?: number;
  }): Promise<{ data: IAllowance[]; total: number }> {
    const { name, hotel_code, limit, skip } = query;

    const data = await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .limit(limit || 10)
      .offset(skip || 0);

    const totalQuery = await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .first();

    return {
      total: ((totalQuery && totalQuery.total) as number) || 0,
      data,
    };
  }

  public async getAllowancesByIds(
    ids: number[],
    hotel_code: number
  ): Promise<IAllowance[]> {
    if (!ids || ids.length === 0) return [];

    return await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .whereIn("id", ids)
      .where("hotel_code", hotel_code);
  }

  public async getSingleAllowance(query: {
    id: number;
    hotel_code: number;
  }): Promise<IAllowance> {
    return await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .andWhere("is_deleted", false)
      .first();
  }

  public async updateAllowance({
    id,
    hotel_code,
    payload,
  }: {
    id: number;
    hotel_code: number;
    payload: {
      name?: string;
      type?: string;
      value?: number;
      is_taxable?: boolean;
    };
  }) {
    return await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async deleteAllowance({
    id,
    hotel_code,
  }: {
    id: number;
    hotel_code: number;
  }) {
    return await this.db("allowances")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  // --------------------------- Deductions --------------------------- //
  public async createDeductions(payload: {
    name: string;
    type: string;
    value: number;
  }) {
    return await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  public async getAllDeductions(query: {
    name?: string;
    hotel_code: number;
    limit?: number;
    skip?: number;
  }): Promise<{ data: IDeduction[]; total: number }> {
    const { name, hotel_code, skip, limit } = query;

    const data = await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .limit(limit || 10)
      .offset(skip || 0);

    const totalQuery = await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .count("id as total")
      .where("hotel_code", hotel_code)
      .andWhere("is_deleted", false)
      .andWhere((qb) => {
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }
      })
      .first();

    return {
      total: ((totalQuery && totalQuery.total) as number) || 0,
      data,
    };
  }

  public async getDeductionsByIds(
    ids: number[],
    hotel_code: number
  ): Promise<IDeduction[]> {
    if (!ids || ids.length === 0) return [];

    return await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .whereIn("id", ids)
      .where("hotel_code", hotel_code);
  }

  public async getSingleDeduction(query: {
    id: number;
    hotel_code: number;
  }): Promise<IDeduction> {
    return await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .select("*")
      .where("hotel_code", query.hotel_code)
      .andWhere("id", query.id)
      .andWhere("is_deleted", false)
      .first();
  }

  public async updateDeduction({
    id,
    hotel_code,
    payload,
  }: {
    id: number;
    hotel_code: number;
    payload: {
      name?: string;
      type?: string;
      value?: number;
    };
  }) {
    return await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  public async deleteDeduction({
    id,
    hotel_code,
  }: {
    id: number;
    hotel_code: number;
  }) {
    return await this.db("deductions")
      .withSchema(this.HR_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  // --------------------------- Employee Allowances --------------------------- //
  public async createEmployeeAllowance(payload: {
    employee_id: number;
    allowance_id: number;
    amount?: number;
  }) {
    return await this.db("employee_allowances")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }

  // --------------------------- Employee Deductions --------------------------- //
  public async createEmployeeDeduction(payload: {
    employee_id: number;
    deduction_id: number;
    amount?: number;
  }) {
    return await this.db("employee_deductions")
      .withSchema(this.HR_SCHEMA)
      .insert(payload, "id");
  }
}
export default HrModel;
