import {
	ICreateExpenseHeadPayload,
	ICreateExpensePayload,
	IExpenseHeadQuery,
	IExpenseWithItems,
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
	}): Promise<{ data: IExpenseHeadQuery[]; total: number }> {
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
					const searchName = `%${name.toLowerCase().trim()}%`;
					this.andWhere((sqb) => {
						sqb.andWhereRaw(`LOWER(eh.name) LIKE ?`, [searchName]);
					});
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
					const searchName = `%${name.toLowerCase().trim()}%`;
					this.andWhere((sqb) => {
						sqb.andWhereRaw(`LOWER(eh.name) LIKE ?`, [searchName]);
					});
				}
			});

		return { total: Number(total[0].total) || 0, data };
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
			remarks: string;
			amount: number;
			expense_id: number;
			expense_head_id: number;
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
		from_date?: string;
		to_date?: string;
		limit?: string;
		skip?: string;
		key?: string;
		hotel_code: number;
	}): Promise<{ data: IExpenseWithItems[]; total: number }> {
		const { limit, skip, hotel_code, from_date, to_date, key } = payload;

		const endDate = to_date ? new Date(to_date) : undefined;
		if (endDate) endDate.setDate(endDate.getDate() + 1);

		const dtbs = this.db("expense as ev").withSchema(
			this.RESERVATION_SCHEMA
		);

		if (limit && skip) {
			dtbs.limit(parseInt(limit));
			dtbs.offset(parseInt(skip));
		}

		const data = await dtbs
			.select(
				"ev.id",
				"ev.hotel_code",
				"ev.voucher_no",
				"ev.expense_date",
				"ev.expense_by as expense_by_id",
				"emp.name as expense_by_name",
				"ev.pay_method",
				"ev.transaction_no",
				"ev.expense_cheque_id",
				"ev.bank_name",
				"ev.branch_name",
				"ev.cheque_no",
				"ev.cheque_date",
				"ev.deposit_date",
				this.db.raw(
					`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date_formatted`
				),
				// "ev.name as expense_name",
				"acc_head.name as account_name",
				"acc.acc_type as account_type",
				"ev.expense_amount",
				"ev.created_at",
				this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ei.id,
              'head_name', eh.name,
              'remarks', ei.remarks,
              'amount', ei.amount
            )
          ) FILTER (WHERE ei.id IS NOT NULL), '[]'
        ) as expense_items
      `)
			)
			.joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
			])
			.joinRaw(`JOIN ?? AS emp ON emp.id = ev.expense_by`, [
				`${this.HR_SCHEMA}.${this.TABLES.employee}`,
			])
			.leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
			.leftJoin("expense_head as eh", "ei.expense_head_id", "eh.id")
			.where("ev.hotel_code", hotel_code)
			.modify((builder) => {
				if (from_date && endDate) {
					builder.andWhereBetween("ev.expense_date", [
						from_date,
						endDate,
					]);
				}
				if (key) {
					builder.andWhere((q) => {
						q.orWhere("eh.name", "like", `%${key}%`)
							.orWhere("acc.name", "like", `%${key}%`)
							.orWhere("ev.voucher_no", "like", `%${key}%`);
					});
				}
			})
			.groupBy(
				"ev.id",
				"emp.name",
				"acc.name",
				"acc.acc_type",
				"acc_head.name"
			)
			.orderBy("ev.id", "desc");

		const total = await this.db("expense as ev")
			.withSchema(this.RESERVATION_SCHEMA)
			.countDistinct("ev.id as total")
			.joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
			])
			.leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
			.leftJoin("expense_head as eh", "ei.expense_head_id", "eh.id") // <--- add this
			.where("ev.hotel_code", hotel_code)
			.modify((builder) => {
				if (from_date && endDate) {
					builder.andWhereBetween("ev.expense_date", [
						from_date,
						endDate,
					]);
				}
				if (key) {
					builder.andWhere((q) => {
						q.orWhere("eh.name", "like", `%${key}%`)
							.orWhere("acc.name", "like", `%${key}%`)
							.orWhere("ev.voucher_no", "like", `%${key}%`);
					});
				}
			})
			.first();

		return { data, total: total ? Number(total.total) : 0 };
	}

	// get single Expense Model
	public async getSingleExpense(
		id: number,
		hotel_code: number
	): Promise<IExpenseWithItems[]> {
		const dtbs = this.db("expense as ev").withSchema(
			this.RESERVATION_SCHEMA
		);

		const data = await dtbs
			.select(
				"ev.id",
				"ev.hotel_code",
				"ev.voucher_no",
				"h.name as hotel_name",
				"h.address as hotel_address",
				// "ev.name as expense_name",
				"acc_head.name as account_name",
				"acc.acc_type as account_type",
				"ev.pay_method",
				this.db.raw(
					`to_char(ev.expense_date, 'YYYY-MM-DD') as expense_date`
				),
				this.db.raw(
					`to_char(ev.created_at, 'YYYY-MM-DD') as expense_created_at`
				),
				"ev.transaction_no",
				"ev.cheque_no",
				"ev.cheque_date",
				"ev.bank_name",
				"ev.branch_name",
				"ev.expense_amount",
				"ev.expense_note",
				this.db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ei.id,
              'head_name', eh.name,
              'remarks', ei.remarks,
              'amount', ei.amount
            )
          ) FILTER (WHERE ei.id IS NOT NULL), '[]'
        ) as expense_items
      `)
			)
			.joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
			])
			.leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
			.leftJoin("expense_head as eh", "ei.expense_head_id", "eh.id")
			.leftJoin("hotels as h", "ev.hotel_code", "h.hotel_code")
			.where("ev.id", id)
			.andWhere("ev.hotel_code", hotel_code)
			.groupBy(
				"ev.id",
				"ev.voucher_no",
				"ev.account_id",
				"ev.expense_date",
				"acc.name",
				"acc.acc_type",
				// "ev.total",
				"ev.created_at",
				"h.name",
				"h.address",
				"ev.pay_method",
				"ev.transaction_no",
				"ev.cheque_no",
				"ev.cheque_date",
				"ev.bank_name",
				"ev.branch_name",
				"acc_head.name"
			);

		return data;
	}
}
export default ExpenseModel;
