import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import ExpenseModel from "../../models/reservationPanel/expenseModel";
import {
	ICreateExpensebody,
	IUpdateExpenseHeadPayload,
} from "../utlis/interfaces/expense.interface";

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
			const { expense_items, total_amount, ...rest } =
				req.body as ICreateExpensebody;

			const files = req.files;
			if (Array.isArray(files) && files.length) {
				files.forEach((file) => {
					const { fieldname, filename } = file;
					switch (fieldname) {
						case "file_1":
							rest.expense_voucher_url_1 = filename as string;
							break;
						case "file_2":
							rest.expense_voucher_url_2 = filename;
							break;
					}
				});
			}

			const accountModel = this.Model.accountModel(trx);
			const employeeModel = this.Model.employeeModel(trx);
			const model = this.Model.expenseModel(trx);

			const { data } = await model.getAllExpense({
				key: rest.expense_no,
				hotel_code,
			});
			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Expense No already exists.",
				};
			}
			console.log(1);
			// account check
			const checkAccount = await accountModel.getSingleAccount({
				hotel_code,
				id: rest.account_id,
			});

			if (!checkAccount.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}
			console.log(2);
			const getSingleEmployee = await employeeModel.getSingleEmployee(
				rest.expense_by,
				hotel_code
			);
			console.log({ getSingleEmployee });
			if (!getSingleEmployee) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Employee not found",
				};
			}

			const year = new Date().getFullYear();

			// get last voucher ID
			const voucherData = await model.getAllIVoucherForLastId();

			const voucherNo = voucherData.length ? voucherData[0].id + 1 : 1;

			const parsed_expense_items = JSON.parse(expense_items);

			console.log(1);
			// Insert expense record
			const payload = {
				...rest,
				voucher_no: `EXP-${year}${voucherNo}`,
				hotel_code,
				created_by,
				expense_amount: total_amount,
				acc_voucher_id: 77,
			};
			// console.log({ payload: rest.expense_date });
			const expenseRes = await model.createExpense(payload);
			console.log(2);
			console.log({ expenseRes });
			const expenseItemPayload = parsed_expense_items.map(
				(item: { id: number; remarks: string; amount: number }) => {
					return {
						expense_head_id: item.id,
						remarks: item.remarks,
						amount: item.amount,
						expense_id: expenseRes[0].id,
					};
				}
			);

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
