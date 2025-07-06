import {
	IcreateEmployee,
	IupdateEmployee,
} from "../../appAdmin/utlis/interfaces/employee.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class EmployeeModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
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
		category?: string;
		hotel_code: number;
	}) {
		const { key, hotel_code, limit, skip } = payload;
		const dtbs = this.db("employee as e");
		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
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
			.andWhere(function () {
				if (key) {
					this.andWhere("e.name", "like", `%${key}%`)
						.orWhere("e.email", "like", `%${key}%`)
						.orWhere("d.name", "like", `%${key}%`);
				}
			})
			.orderBy("e.id", "desc");

		const total = await this.db("employee as e")
			.count("e.id as total")
			.withSchema(this.RESERVATION_SCHEMA)
			.leftJoin("department as d", "e.department_id", "d.id")
			.leftJoin("designation as de", "e.designation_id", "de.id")
			.where("e.hotel_code", hotel_code)
			.andWhere(function () {
				if (key) {
					this.andWhere("e.name", "like", `%${key}%`)
						.orWhere("e.email", "like", `%${key}%`)
						.orWhere("d.name", "like", `%${key}%`);
				}
			});

		return { data, total: total[0].total };
	}

	// Get Single Employee
	public async getSingleEmployee(id: number, hotel_code: number) {
		const data = await this.db("employee as e")
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"e.id",
				"e.name",
				"e.email",
				"e.mobile_no",
				"e.photo",
				"e.blood_group",
				"dep.id as department_id",
				"dep.name as department_name",
				"des.id as designation_id",
				"des.name as designation_name",
				"e.salary",
				this.db.raw("to_char(e.dob, 'YYYY-MM-DD') as dob"),
				this.db.raw(
					"to_char(e.appointment_date, 'YYYY-MM-DD') as appointment_date"
				),
				this.db.raw(
					"to_char(e.joining_date, 'YYYY-MM-DD') as joining_date"
				),
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
			.where("e.id", id)
			.andWhere("e.hotel_code", hotel_code);

		return data.length > 0 ? data[0] : [];
	}

	// Update Employee
	public async updateEmployee(id: number, payload: IupdateEmployee) {
		return await this.db("employee")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.update(payload);
	}

	// Delete Employee
	public async deleteEmployee(id: number) {
		return await this.db("employee")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.del();
	}
}
export default EmployeeModel;
