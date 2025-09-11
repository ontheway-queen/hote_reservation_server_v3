import {
	ICreateExpensePayload,
	IExpenseWithItems,
} from "../../appAdmin/utlis/interfaces/expense.interface";
import { TDB } from "../../common/types/commontypes";
import { EXPENSE_GROUP } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

class ExpenseModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async getExpenseHeads({
		search,
		hotel_code,
	}: {
		search?: string;
		hotel_code: number;
	}) {
		const results = this.db("acc_heads")
			.select("id as head_id", "name", "code")
			.withSchema(this.ACC_SCHEMA)
			.where("group_code", EXPENSE_GROUP)
			.andWhere((builder) => {
				builder
					.whereNull("hotel_code")
					.orWhere("hotel_code", hotel_code);
			})
			.modify((e) => {
				if (search) e.whereRaw("name LIKE ?", [`%${search}%`]);
			});
		return results;
	}
	public async createExpense(payload: ICreateExpensePayload) {
		return await this.db("expense")
			.withSchema(this.ACC_SCHEMA)
			.insert(payload, "id");
	}

	public async createExpenseItem(
		payload: {
			ex_voucher_id: number;
			remarks: string;
			amount: number;
			expense_id: number;
			expense_head_id: number;
		}[]
	) {
		return await this.db("expense_items")
			.withSchema(this.ACC_SCHEMA)
			.insert(payload);
	}

	public async getExpenseLastId() {
		return await this.db("expense")
			.select("id")
			.withSchema(this.ACC_SCHEMA)
			.orderBy("id", "desc")
			.limit(1);
	}

	public async getLastExpenseNo(): Promise<{ expense_no: string }> {
		return await this.db("expense")
			.select("expense_no")
			.withSchema(this.ACC_SCHEMA)
			.orderBy("id", "desc")
			.limit(1)
			.first();
	}

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

		const dtbs = this.db("expense as ev").withSchema(this.ACC_SCHEMA);

		if (limit && skip) {
			dtbs.limit(parseInt(limit));
			dtbs.offset(parseInt(skip));
		}

		const data = await dtbs
			.select(
				"ev.id",
				"ev.hotel_code",
				"ev.expense_no",
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
              'head_name', ah.name,
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
			.leftJoin("expense_items as ei", function () {
				this.on("ei.expense_id", "=", "ev.id").andOnVal(
					"ei.is_deleted",
					"=",
					false
				);
			})
			.leftJoin("acc_heads as ah", "ei.expense_head_id", "ah.id")
			.where("ev.hotel_code", hotel_code)
			.andWhere("ev.is_deleted", false)
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
			.withSchema(this.ACC_SCHEMA)
			.countDistinct("ev.id as total")
			.joinRaw(`JOIN ?? AS acc ON acc.id = ev.account_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts}`,
			])
			.joinRaw(`JOIN ?? AS acc_head ON acc_head.id = acc.acc_head_id`, [
				`${this.ACC_SCHEMA}.${this.TABLES.accounts_heads}`,
			])
			.leftJoin("expense_items as ei", "ei.expense_id", "ev.id")
			.leftJoin("acc_heads as eh", "ei.expense_head_id", "eh.id")
			.where("ev.hotel_code", hotel_code)
			.andWhere("ev.is_deleted", false)
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

	public async getSingleExpense(
		id: number,
		hotel_code: number
	): Promise<IExpenseWithItems[]> {
		const dtbs = this.db("expense as ev").withSchema(this.ACC_SCHEMA);

		const data = await dtbs
			.select(
				"ev.id",
				"ev.hotel_code",
				"ev.expense_no",
				"h.name as hotel_name",
				"h.address as hotel_address",
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
              'id', ah.id,
              'head_name', ah.name,
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
			.leftJoin("expense_items as ei", function () {
				this.on("ei.expense_id", "=", "ev.id").andOnVal(
					"ei.is_deleted",
					"=",
					false
				);
			})
			.joinRaw(
				`LEFT JOIN ${this.ACC_SCHEMA}.acc_heads as ah ON ei.expense_head_id = ah.id`
			)
			.joinRaw(
				`LEFT JOIN ${this.RESERVATION_SCHEMA}.hotels as h ON ev.hotel_code = h.hotel_code`
			)
			.where("ev.id", id)
			.andWhere("ev.hotel_code", hotel_code)
			.andWhere("ev.is_deleted", false)
			.groupBy(
				"ev.id",
				"ev.voucher_no",
				"ev.account_id",
				"ev.expense_date",
				"acc.name",
				"acc.acc_type",
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

	public async getExpenseItemByExpenseId(expense_id: number) {
		return await this.db("expense_items")
			.withSchema(this.ACC_SCHEMA)
			.select("*")
			.where("expense_id", expense_id)
			.andWhere("is_deleted", false);
	}

	public async updateExpense({
		id,
		hotel_code,
		payload,
	}: {
		id: number;
		hotel_code: number;
		payload: {};
	}) {
		return await this.db("expense")
			.withSchema(this.ACC_SCHEMA)
			.where("id", id)
			.andWhere("hotel_code", hotel_code)
			.update(payload);
	}

	public async updateExpenseItems({
		id,
		payload,
	}: {
		id: number;
		payload: any;
	}) {
		const { id: _ignore, ...rest } = payload;
		return await this.db("expense_items")
			.withSchema(this.ACC_SCHEMA)
			.where("id", id)
			.update(rest);
	}

	public async deleteExpense({
		id,
		payload,
	}: {
		id: number;
		payload: {
			hotel_code: number;
			deleted_by: number;
			is_deleted: boolean;
		};
	}) {
		return await this.db("expense")
			.withSchema(this.ACC_SCHEMA)
			.where("id", id)
			.andWhere("hotel_code", payload.hotel_code)
			.update(payload);
	}

	public async deleteExpenseItem(expense_id: number) {
		return await this.db("expense_items")
			.withSchema(this.ACC_SCHEMA)
			.where("expense_id", expense_id)
			.update({ is_deleted: true });
	}
}
export default ExpenseModel;
