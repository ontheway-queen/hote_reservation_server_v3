import {
	ICreateExpenseHeadPayload,
	ICreateExpensePayload,
	IUpdateExpenseHeadPayload,
} from "../../appAdmin/utlis/interfaces/expense.interface";
import { TDB } from "../../common/types/commontypes";
import Schema from "../../utils/miscellaneous/schema";

class ExpenseModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	// Create Expense Head Model
	public async createExpenseHead(payload: ICreateExpenseHeadPayload) {
		return await this.db("expense_head")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// Get All Expense Head Model
	public async getAllExpenseHead(payload: {
		limit?: string;
		skip?: string;
		name: string;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, name } = payload;

		const dtbs = this.db("expense_head as eh");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"eh.id",
				"eh.name",
				"ua.id as created_by_id",
				"ua.name as created_by_name",
				"eh.is_deleted"
			)
			.leftJoin("user_admin as ua", "ua.id", "eh.created_by")
			.where("eh.hotel_code", hotel_code)
			.andWhere("eh.is_deleted", false)
			.andWhere(function () {
				if (name) {
					this.andWhere("eh.name", "like", `%${name}%`);
				}
			})
			.orderBy("eh.id", "desc");

		const total = await this.db("expense_head as eh")
			.withSchema(this.RESERVATION_SCHEMA)
			.count("eh.id as total")
			.where("eh.hotel_code", hotel_code)
			.andWhere("eh.is_deleted", false)
			.andWhere(function () {
				if (name) {
					this.andWhere("eh.name", "like", `%${name}%`);
				}
			});

		return { total: total[0].total, data };
	}

	// Update Expense Head Model
	public async updateExpenseHead(
		id: number,
		payload: IUpdateExpenseHeadPayload
	) {
		return await this.db("expense_head")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.andWhere("is_deleted", false)
			.update(payload);
	}

	// Delete Expense Head Model
	public async deleteExpenseHead(id: number) {
		return await this.db("expense_head")
			.withSchema(this.RESERVATION_SCHEMA)
			.where({ id })
			.andWhere("is_deleted", false)
			.update({ is_deleted: true });
	}

	// Create Expense Model
	public async createExpense(payload: ICreateExpensePayload) {
		return await this.db("expense")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload, "id");
	}

	// create expense item
	public async createExpenseItem(
		payload: {
			name: string;
			amount: number;
			expense_id: number;
		}[]
	) {
		return await this.db("expense_items")
			.withSchema(this.RESERVATION_SCHEMA)
			.insert(payload);
	}

	// get all voucher last id
	public async getAllIVoucherForLastId() {
		return await this.db("expense")
			.select("id")
			.withSchema(this.RESERVATION_SCHEMA)
			.orderBy("id", "desc")
			.limit(1);
	}

	// get All Expense Model
	public async getAllExpense(payload: {
		from_date: string;
		to_date: string;
		limit: string;
		skip: string;
		key: string;
		hotel_code: number;
	}) {
		const { limit, skip, hotel_code, from_date, to_date, key } = payload;

		const endDate = new Date(to_date as string);
		endDate.setDate(endDate.getDate() + 1);

		const dtbs = this.db("expense_view as ev");

		if (limit && skip) {
			dtbs.limit(parseInt(limit as string));
			dtbs.offset(parseInt(skip as string));
		}

		const data = await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"ev.id",
				"ev.voucher_no",
				"ev.ac_tr_ac_id as account_id",
				"ev.expense_date as expense_date",
				"ev.name as expense_name",
				"a.name as account_name",
				"a.ac_type",
				"ev.total as expense_amount",
				"ev.created_at",
				"ev.expense_items"
			)
			.where("ev.hotel_code", hotel_code)
			.leftJoin("account as a", "ev.ac_tr_ac_id", "a.id")
			.andWhere(function () {
				if (from_date && to_date) {
					this.andWhereBetween("ev.expense_date", [
						from_date,
						endDate,
					]);
				}
				if (key) {
					this.andWhere((builder) => {
						builder
							.orWhere("ev.name", "like", `%${key}%`)
							.orWhere("a.name", "like", `%${key}%`);
					});
				}
			})
			.groupBy("ev.id")
			.orderBy("ev.id", "desc");

		const total = await this.db("expense_view as ev")
			.withSchema(this.RESERVATION_SCHEMA)
			.countDistinct("ev.id as total")
			.leftJoin("account as a", "ev.ac_tr_ac_id", "a.id")
			.where("ev.hotel_code", hotel_code)
			.andWhere(function () {
				if (from_date && to_date) {
					this.andWhereBetween("ev.expense_date", [
						from_date,
						endDate,
					]);
				}
				if (key) {
					this.andWhere((builder) => {
						builder
							.orWhere("ev.name", "like", `%${key}%`)
							.orWhere("a.name", "like", `%${key}%`);
					});
				}
			})
			.first();

		return { data, total: total ? total.total : 0 };
	}

	// get single Expense Model
	public async getSingleExpense(id: number, hotel_code: number) {
		const dtbs = this.db("expense_view as ev");
		return await dtbs
			.withSchema(this.RESERVATION_SCHEMA)
			.select(
				"ev.id",
				"ev.hotel_code",
				"ev.voucher_no",
				"h.name as hotel_name",
				"h.address as hotel_address",
				"h.email as hotel_email",
				"h.phone as hotel_phone",
				"h.website as hotel_website",
				"h.logo as hotel_logo",
				"ev.name as expense_name",
				"a.name as account_name",
				"a.account_number",
				"a.ac_type",
				"ev.expense_date",
				"a.bank as bank_name",
				"a.branch",
				"ev.total as total_cost",
				"ev.remarks as expense_details",
				"ev.created_at as expense_created_at",
				"ev.expense_items"
			)

			.leftJoin("hotel as h", "ev.hotel_code", "h.id")
			.leftJoin("account as a", "ev.ac_tr_ac_id", "a.id")
			.where("ev.id", id)
			.andWhere("ev.hotel_code", hotel_code);
	}
}
export default ExpenseModel;
