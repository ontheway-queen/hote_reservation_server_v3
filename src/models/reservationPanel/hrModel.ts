import {
  IcreateEmployee,
  IEmployeeListResponse,
  IEmployeeResponse,
  IupdateEmployee,
} from "../../appAdmin/utlis/interfaces/hr.interface";
import {
  ICreatedepartment,
  ICreatePayrollMonths,
  IUpdatedepartment,
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

  // create  Payroll Months
  public async createPayrollMonths(payload: ICreatePayrollMonths) {
    return await this.db("payroll_months")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // Get All PayrollMonths
  public async getPayrollMonths(payload: {
    limit?: string;
    skip?: string;
    name?: string;
    month_id?: number;
    hotel_code: number;
  }) {
    const { limit, skip, hotel_code, name, month_id } = payload;
    let dtbs = this.db("payroll_months as pm").withSchema(
      this.RESERVATION_SCHEMA
    );

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
    let countQuery = this.db("payroll_months as pm").withSchema(
      this.RESERVATION_SCHEMA
    );

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

  // Update Payroll Months
  public async updatePayrollMonths(id: number, payload: IUpdatePayrollMonths) {
    return await this.db("payroll_months")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id })
      .andWhere("is_deleted", false)
      .update(payload);
  }

  // Delete Payroll Months
  public async deletePayrollMonths(id: number) {
    return await this.db("payroll_months")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id })
      .andWhere("is_deleted", false)
      .update({ is_deleted: true });
  }

  // create Department
  public async createDepartment(payload: ICreatedepartment) {
    return await this.db("department")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // Get All Department
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
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "d.id",
        "d.hotel_code",
        "d.name as department_name",
        "d.status",
        "d.is_deleted",
        "d.created_by as created_by_id",
        "ua.name as created_by_name"
      )
      .leftJoin("user_admin as ua", "d.created_by", "ua.id")
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
      .withSchema(this.RESERVATION_SCHEMA)
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

    return { total: total[0].total, data };
  }

  // Get Single Department
  public async getSingleDepartment(id: number, hotel_code: number) {
    return await this.db("department as d")
      .withSchema(this.RESERVATION_SCHEMA)
      .select(
        "d.id",
        "d.hotel_code",
        "d.name",
        "d.status",
        "d.is_deleted",
        "ua.id as created_by_id",
        "ua.name as created_by_name"
      )
      .leftJoin("user_admin as ua", "d.created_by", "ua.id")
      .where("d.id", id)
      .andWhere("d.hotel_code", hotel_code)
      .andWhere("d.is_deleted", false)
      .first();
  }

  // Update Department
  public async updateDepartment(
    id: number,
    hotel_code: number,
    payload: IUpdatedepartment
  ) {
    return await this.db("department")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id, hotel_code })
      .update(payload);
  }

  // Delete Department
  public async deleteDepartment(id: number, hotel_code: number) {
    return await this.db("department")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id, hotel_code })
      .update({ is_deleted: true });
  }

  // Create Employee
  public async insertEmployee(payload: IcreateEmployee) {
    return await this.db("employee")
      .withSchema(this.RESERVATION_SCHEMA)
      .insert(payload);
  }

  // Get All Employee Model
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
        "e.mobile_no",
        "d.name as department",
        "de.name as designation",
        "e.salary",
        "e.joining_date",
        "e.status"
      )
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("department as d", "e.department_id", "d.id")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.hotel_code", hotel_code)
      .andWhere("e.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.where("e.name", "like", `%${key}%`)
            .orWhere("e.email", "like", `%${key}%`)
            .orWhere("d.name", "like", `%${key}%`);
        }
      })
      .andWhere(function () {
        if (department) {
          this.where("d.name", "like", `%${department}%`);
        }
        if (designation) {
          this.where("de.name", "like", `%${designation}%`);
        }
      })
      .orderBy("e.id", "desc");

    const total = await this.db("employee as e")
      .withSchema(this.RESERVATION_SCHEMA)
      .count("e.id as total")
      .leftJoin("department as d", "e.department_id", "d.id")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.hotel_code", hotel_code)
      .andWhere("e.is_deleted", false)
      .andWhere(function () {
        if (key) {
          this.where("e.name", "like", `%${key}%`)
            .orWhere("e.email", "like", `%${key}%`)
            .orWhere("d.name", "like", `%${key}%`);
        }
      })
      .andWhere(function () {
        if (department) {
          this.where("d.name", "like", `%${department}%`);
        }
        if (designation) {
          this.where("de.name", "like", `%${designation}%`);
        }
      });

    return {
      data,
      total: Number(total[0].total),
    };
  }

  // Get Single Employee
  public async getSingleEmployee(
    id: number,
    hotel_code: number
  ): Promise<IEmployeeResponse | null> {
    const data = await this.db("employee as e")
      .withSchema(this.RESERVATION_SCHEMA)
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

  // Update Employee
  public async updateEmployee(id: number, payload: IupdateEmployee) {
    console.log({ payload });
    return await this.db("employee")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id, is_deleted: false })
      .update(payload);
  }

  // Delete Employee
  public async deleteEmployee(id: number) {
    return await this.db("employee")
      .withSchema(this.RESERVATION_SCHEMA)
      .where({ id, is_deleted: false })
      .update({ is_deleted: true });
  }

  // get all employee using department id
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
      .withSchema(this.RESERVATION_SCHEMA)
      .leftJoin("department as d", "e.department_id", "d.id")
      .leftJoin("designation as de", "e.designation_id", "de.id")
      .where("e.department_id", id)
      .andWhere("e.is_deleted", false)
      .orderBy("e.id", "desc");

    const total = await this.db("employee as e")
      .withSchema(this.RESERVATION_SCHEMA)
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
}
export default HrModel;
