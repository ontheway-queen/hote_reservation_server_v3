import {
	getAllStaffsResponse,
	IGetSingleStaffResponse,
} from "../../appRestaurantAdmin/utils/interface/staff.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class RestaurantStaffModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async insertStaffData(payload: {
		hotel_code: number;
		restaurant_id: number;
		employee_id: number;
	}) {
		console.log({ payload });
		return await this.db("restaurant_staff")
			.withSchema(this.RESTAURANT_SCHEMA)
			.insert(payload, "id");
	}

	public async getAllStaffs(query: {
		hotel_code: number;
		restaurant_id: number;
		name?: string;
		limit?: number;
		skip?: number;
	}): Promise<getAllStaffsResponse> {
		const { hotel_code, restaurant_id, name, limit, skip } = query;

		const data = await this.db("restaurant_staff as rs")
			.withSchema(this.RESTAURANT_SCHEMA)
			.select(
				"rs.id",
				"rs.hotel_code",
				"rs.restaurant_id",
				"rs.employee_id",
				"e.name as employee_name",
				"e.photo as employee_photo",
				"e.email as employee_email",
				"e.contact_no as employee_contact_no",
				"e.status as employee_status",
				"rs.created_at",
				"rs.updated_at",
				"rs.is_deleted"
			)
			.joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
				`${this.HR_SCHEMA}.employee`,
			])
			.where("rs.hotel_code", hotel_code)
			.andWhere("rs.restaurant_id", restaurant_id)
			.andWhere("rs.is_deleted", false)
			.andWhere((qb) => {
				if (name) {
					qb.andWhere("e.name", "ilike", `%${name}%`);
				}
			})
			.limit(limit || 100)
			.offset(skip || 0);

		const countResult = await this.db("restaurant_staff as rs")
			.withSchema(this.RESTAURANT_SCHEMA)
			.joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
				`${this.HR_SCHEMA}.employee`,
			])
			.where("rs.hotel_code", hotel_code)
			.andWhere("rs.restaurant_id", restaurant_id)
			.andWhere("rs.is_deleted", false)
			.modify((qb) => {
				if (name) {
					qb.andWhere("e.name", "ilike", `%${name}%`);
				}
			})
			.count<{ count: string }>("rs.id as count");

		const count = Array.isArray(countResult)
			? countResult[0].count
			: countResult.count;

		const total = parseInt(count, 10);

		return {
			total,
			data,
		};
	}

	public async getSingleStaff(query: {
		hotel_code: number;
		restaurant_id: number;
		id?: number;
		employee_id?: number;
	}): Promise<IGetSingleStaffResponse> {
		return await this.db("restaurant_staff as rs")
			.withSchema(this.RESTAURANT_SCHEMA)
			.select(
				"rs.id",
				"rs.hotel_code",
				"rs.restaurant_id",
				"rs.employee_id",
				"e.name as employee_name",
				"e.photo as employee_photo",
				"e.email as employee_email",
				"e.contact_no as employee_contact_no",
				"e.dob as employee_dob",
				"e.appointment_date as employee_appointment_date",
				"e.joining_date as employee_joining_date",
				"e.address as employee_address",
				"bg.name as blood_group_name",
				"e.status as employee_status",
				"rs.created_at",
				"rs.updated_at",
				"rs.is_deleted"
			)
			.joinRaw(`JOIN ?? AS e ON rs.employee_id = e.id`, [
				`${this.HR_SCHEMA}.employee`,
			])
			.joinRaw(`LEFT JOIN ?? as bg ON bg.id = e.blood_group`, [
				`${this.DBO_SCHEMA}.${this.TABLES.blood_group}`,
			])
			.where("rs.hotel_code", query.hotel_code)
			.andWhere("rs.restaurant_id", query.restaurant_id)
			.andWhere((qb) => {
				if (query.employee_id) {
					qb.andWhere("rs.employee_id", query.employee_id);
				}

				if (query.id) {
					qb.andWhere("rs.id", query.id);
				}
			})
			.andWhere("rs.is_deleted", false)
			.first();
	}

	public async removeStaff(query: {
		id: number;
		hotel_code: number;
		restaurant_id: number;
	}) {
		return await this.db("restaurant_staff")
			.withSchema(this.RESTAURANT_SCHEMA)
			.where("id", query.id)
			.andWhere("hotel_code", query.hotel_code)
			.andWhere("restaurant_id", query.restaurant_id)
			.andWhere("is_deleted", false)
			.update({ is_deleted: true });
	}
}
export default RestaurantStaffModel;
