import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	ICreateExpensebody,
	IUpdateExpenseHeadPayload,
} from "../utlis/interfaces/expense.interface";
import ExpenseModel from "../../models/reservationPanel/expenseModel";

export class ExpenseService extends AbstractServices {
	constructor() {
		super();
	}

	// create Expense Head Service
	public async createExpenseHead(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id } = req.hotel_admin;
			const { name } = req.body;

			// expense head check
			const expenseModel = this.Model.expenseModel();
			const { data: checkHead } = await expenseModel.getAllExpenseHead({
				name,
				hotel_code,
			});

			if (checkHead.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message:
						"Same Expense Head already exists, give another unique Expense Head",
				};
			}

			// model
			const model = new ExpenseModel(trx);

			const res = await model.createExpenseHead({
				hotel_code,
				name,
				created_by: id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Expense Head created successfully.",
			};
		});
	}

	// Get all Expense Head list
	public async getAllExpenseHead(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, name } = req.query;

		const model = this.Model.expenseModel();

		const { data, total } = await model.getAllExpenseHead({
			limit: limit as string,
			skip: skip as string,
			name: name as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Update Expense Head Service
	public async updateExpenseHead(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { id } = req.params;

			const updatePayload = req.body as IUpdateExpenseHeadPayload;

			const model = this.Model.expenseModel(trx);
			const res = await model.updateExpenseHead(parseInt(id), {
				hotel_code,
				name: updatePayload.name,
			});

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Expense Head updated successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Expense Head didn't find",
				};
			}
		});
	}

	// Delete Expense Head Service
	public async deleteExpenseHead(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;

			const model = this.Model.expenseModel(trx);
			const res = await model.deleteExpenseHead(parseInt(id));

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Expense Head deleted successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Expense Head didn't find",
				};
			}
		});
	}

	// Create Expense Service
	public async createExpense(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: created_by } = req.hotel_admin;

			const { expense_item, ac_tr_ac_id, ...rest } =
				req.body as ICreateExpensebody;

			const accountModel = this.Model.accountModel(trx);
			const model = this.Model.expenseModel(trx);

			// account check

			const checkAccount = await accountModel.getSingleAccount({
				hotel_code,
				id: ac_tr_ac_id,
			});

			if (!checkAccount.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}

			const year = new Date().getFullYear();

			// get last voucher ID
			const voucherData = await model.getAllIVoucherForLastId();

			const voucherNo = voucherData.length ? voucherData[0].id + 1 : 1;

			let expenseTotal = 0;
			expense_item.forEach((item: any) => {
				expenseTotal += item.amount;
			});

			// Insert expense record
			const expenseRes = await model.createExpense({
				...rest,
				voucher_no: `EXP-${year}${voucherNo}`,
				ac_tr_ac_id,
				hotel_code,
				created_by,
				total: expenseTotal,
			});

			const expenseItemPayload = expense_item.map((item: any) => {
				return {
					expense_head_id: item.expense_head_id,
					name: item.name,
					amount: item.amount,
					expense_id: expenseRes[0].id,
				};
			});

			//   expense item
			await model.createExpenseItem(expenseItemPayload);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Expense created successfully.",
			};
		});
	}

	// get all Expense service
	public async getAllExpense(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { from_date, to_date, limit, skip, key } = req.query;

		const model = this.Model.expenseModel();

		const { data, total } = await model.getAllExpense({
			from_date: from_date as string,
			to_date: to_date as string,
			limit: limit as string,
			skip: skip as string,
			key: key as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// get single expense service
	public async getSingleExpense(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;

		const data = await this.Model.expenseModel().getSingleExpense(
			parseInt(id),
			hotel_code
		);

		if (!data.length) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data[0],
		};
	}
}
export default ExpenseService;
