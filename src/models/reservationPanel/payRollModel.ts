import {
	ICreateAdditionBody,
	ICreatedeductionBody,
	ICreatePayrollBody,
	IInsertPaySlip,
	IPayrollList,
	IServiceChargeDistribution,
	ISinglePayroll,
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
		salary_date,
	}: {
		employee_id: number;
		hotel_code: number;
		salary_date: string;
	}): Promise<boolean> {
		const result = await this.db("payroll as p")
			.withSchema(this.HR_SCHEMA)
			.count("p.id as total")
			.where("p.employee_id", employee_id)
			.andWhere("p.hotel_code", hotel_code)
			.andWhereRaw(
				"TO_CHAR(p.month, 'YYYY-MM') = TO_CHAR(?::date, 'YYYY-MM')",
				[salary_date]
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

	// create Service Charge Distribution
	public async createServiceChargeDistribution(
		payload: IServiceChargeDistribution
	) {
		return await this.db("service_charge_distribution")
			.withSchema(this.HR_SCHEMA)
			.insert(payload);
	}

	// Insert payslip
	public async insertPaySlip(payload: IInsertPaySlip) {
		return await this.db("payslips")
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
				"p.total_allowance",
				"p.total_deduction",
				"p.service_charge",
				"p.total_overtime",
				"e.salary as base_salary",
				"p.net_salary",
				"p.month as salary_date"
			)
			.leftJoin("employee as e", "e.id", "p.employee_id")
			.leftJoin("designation as de", "de.id", "e.designation_id")
			.where("p.hotel_code", hotel_code)
			.andWhere(function () {
				if (from_date && to_date) {
					this.andWhereBetween("p.salary_date", [from_date, to_date]);
				}
				if (key) {
					this.andWhere("e.name", "like", `%${key}%`)
						.orWhere("de.name", "like", `%${key}%`)
						.orWhere("a.name", "like", `%${key}%`);
				}
			})
			.orderBy("p.id", "desc");

		const total = await this.db("payroll as p")
			.count("p.id as total")
			.withSchema(this.HR_SCHEMA)
			.leftJoin("employee as e", "e.id", "p.employee_id")
			.leftJoin("designation as de", "de.id", "e.designation_id")
			.where("p.hotel_code", hotel_code)
			.andWhere(function () {
				if (from_date && to_date) {
					this.andWhereBetween("p.salary_date", [from_date, to_date]);
				}
				if (key) {
					this.andWhere("e.name", "like", `%${key}%`)
						.orWhere("de.name", "like", `%${key}%`)
						.orWhere("a.name", "like", `%${key}%`);
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
				"e.name as employee_name",
				"des.name as employee_designation",
				"e.contact_no as employee_phone",
				"p.total_allowance",
				"p.total_deduction",
				"p.service_charge",
				"p.total_overtime",
				"e.salary as base_salary",
				"p.net_salary",
				"p.month as salary_date"
			)
			.joinRaw(`JOIN ?? as h ON h.hotel_code = p.hotel_code`, [
				`${this.RESERVATION_SCHEMA}.${this.TABLES.hotels}`,
			])
			.join("employee as e", "e.id", "p.employee_id")
			.join("designation as des", "des.id", "e.designation_id")
			.leftJoin("employee_deductions as ed", "ed.payroll_id", "p.id")
			.leftJoin("deductions as d", "d.id", "ed.deduction_id")
			.leftJoin("employee_allowances as ea", "ea.payroll_id", "p.id")
			.leftJoin("allowances as a", "a.id", "ea.allowance_id")
			.where("p.id", id)
			.andWhere("p.hotel_code", hotel_code)
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
				"des.name"
			)
			.select(
				this.db.raw(`
				COALESCE(
					JSON_AGG(
						DISTINCT JSONB_BUILD_OBJECT(
							'id', ed.id,
							'deduction_name', d.name,
							'amount', ed.amount
						)
					) FILTER (WHERE ed.id IS NOT NULL), '[]'
				) AS deductions
			`),
				this.db.raw(`
				COALESCE(
					JSON_AGG(
						DISTINCT JSONB_BUILD_OBJECT(
							'id', ea.id,
							'allowance_name', a.name,
							'amount', ea.amount
						)
					) FILTER (WHERE ea.id IS NOT NULL), '[]'
				) AS allowances
			`)
			)
			.first();
	}
}
export default PayRollModel;
