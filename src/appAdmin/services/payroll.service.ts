import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";

class PayRollService extends AbstractServices {
	constructor() {
		super();
	}

	//=================== Payroll Service ======================//

	public async createPayRoll(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;

			const { deductions, others, ...rest } = req.body;

			const files = (req.files as Express.Multer.File[]) || [];

			if (files.length) {
				rest["docs"] = files[0].filename;
			}

			// Check account
			const accountModel = this.Model.accountModel(trx);

			const checkAccount = await accountModel.getSingleAccount({
				hotel_code,
				id: rest.ac_tr_ac_id,
			});
			if (!checkAccount.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}

			const last_balance = checkAccount[0].last_balance;

			if (last_balance < rest.total_salary) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Insufficient balance in this account for pay",
				};
			}

			const model = this.Model.payRollModel(trx);

			// Get last voucher ID
			const year = new Date().getFullYear();

			const voucherData = await model.getAllIVoucherForLastId();

			const voucherNo = voucherData.length ? voucherData[0].id + 1 : 1;

			const res = await model.CreatePayRoll({
				...rest,
				hotel_code,
				voucher_no: `PR-${year}${voucherNo}`,
				ac_tr_ac_id: rest.ac_tr_ac_id,
				gross_salary: rest.gross_salary,
				total_salary: rest.total_salary,
			});

			const payroll_id = res[0].id;

			// Insert payroll deductions
			const deduction_parse = deductions ? JSON.parse(deductions) : [];

			if (deduction_parse.length) {
				const deductionsPayload = deduction_parse.map(
					(deduction: any) => {
						return {
							payroll_id,
							deduction_amount: deduction.deduction_amount,
							deduction_reason: deduction.deduction_reason,
						};
					}
				);
				await model.createPayRoll_deductions(deductionsPayload);
			}

			// Insert payroll additions
			const addition_parse = others ? JSON.parse(others) : [];

			if (addition_parse.length) {
				const additionsPayload = addition_parse.map((addition: any) => {
					return {
						payroll_id,
						hours: addition.hours,
						other_amount: addition.other_amount,
						other_details: addition.other_details,
					};
				});
				console.log({ additionsPayload });
				await model.createPayRoll_additions(additionsPayload);
			}
			// get last account ledger
			// const lastAL = await accountModel.getLastAccountLedgerId(
			// 	hotel_code
			// );

			// const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;

			// Insert account ledger
			// await accountModel.insertAccountLedger({
			// 	ac_tr_ac_id: rest.ac_tr_ac_id,
			// 	hotel_code,
			// 	transaction_no: `TRX-${year - ledger_id}`,
			// 	ledger_debit_amount: rest.total_salary,
			// 	ledger_details: `Balance Debited by Employee PayRoll as Salary`,
			// });

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Payroll created successfully.",
			};
		});
	}

	// Get all Pay Roll
	public async getAllPayRoll(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, key, from_date, to_date } = req.query;

		const model = this.Model.payRollModel();

		const { data, total } = await model.getAllPayRoll({
			limit: limit as string,
			skip: skip as string,
			key: key as string,
			from_date: from_date as string,
			to_date: to_date as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// get Single payRoll
	public async getSinglePayRoll(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;

		const data = await this.Model.payRollModel().getSinglePayRoll(
			parseInt(id),
			hotel_code
		);

		if (!data) {
			throw new CustomError(
				`The requested payroll with ID: ${id} not found.`,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data,
		};
	}
}
export default PayRollService;
