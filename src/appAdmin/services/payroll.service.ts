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
			const { hotel_code, id } = req.hotel_admin;
			const { deductions, allowances, account_id, ...rest } = req.body;
			console.log({ account_id });
			const files = (req.files as Express.Multer.File[]) || [];
			if (files.length) {
				for (const { fieldname, filename } of files) {
					rest[fieldname] = filename;
				}
			}

			const employeeModel = this.Model.employeeModel(trx);
			const model = this.Model.payRollModel(trx);
			const accountModel = this.Model.accountModel(trx);

			const isEmployeeExists = await employeeModel.getSingleEmployee(
				rest.employee_id,
				hotel_code
			);

			if (!isEmployeeExists) {
				throw new CustomError(
					"Employee with the related id not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const isPayrollExistsForMonth = await model.hasPayrollForMonth({
				employee_id: isEmployeeExists.id,
				hotel_code,
				salary_date: rest.salary_date,
			});
			if (isPayrollExistsForMonth) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: this.ResMsg.HTTP_CONFLICT,
				};
			}

			// Check account
			const checkAccount = await accountModel.getSingleAccount({
				hotel_code,
				id: account_id,
			});

			if (!checkAccount.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}

			// const last_balance = checkAccount[0].last_balance;

			// if (last_balance < rest.total_salary) {
			// 	return {
			// 		success: false,
			// 		code: this.StatusCode.HTTP_BAD_REQUEST,
			// 		message: "Insufficient balance in this account for pay",
			// 	};
			// }

			let totalDays = rest.total_days;
			rest.daily_rate = Number(rest.basic_salary) / totalDays;
			rest.payable_days = totalDays - (rest.unpaid_leave_days || 0);
			rest.unpaid_leave_deduction =
				rest.daily_rate * (rest.unpaid_leave_days || 0);

			rest.daily_rate = Number(rest.basic_salary) / rest.total_days;

			rest.payable_days =
				rest.total_days -
				((rest.leave_days || 0) + (rest.unpaid_leave_days || 0));
			rest.unpaid_leave_deduction =
				rest.daily_rate * (rest.unpaid_leave_days || 0);

			const totalDaysCheck =
				(rest.payable_days || 0) +
				(rest.leave_days || 0) +
				(rest.unpaid_leave_days || 0);

			if (totalDaysCheck !== rest.total_days) {
				throw new CustomError(
					`Total days mismatch!`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			// 4. Validate unpaid_leave_deduction
			const expectedUnpaidDeduction =
				rest.daily_rate * (rest.unpaid_leave_days || 0);
			if (
				Number(rest.unpaid_leave_deduction?.toFixed(2)) !==
				Number(expectedUnpaidDeduction.toFixed(2))
			) {
				throw new CustomError(
					`Unpaid leave deduction mismatch!`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			const deduction_parse = deductions ? JSON.parse(deductions) : [];
			const allowances_parse = allowances ? JSON.parse(allowances) : [];

			let totalDeductions = 0;
			let totalAllowances = 0;

			// 🔹 Handle Deductions
			let deductionsPayload: any[] = [];
			if (deduction_parse.length) {
				deductionsPayload = await Promise.all(
					deduction_parse.map(async (deduction: any) => {
						// const isDeductionExists = await this.Model.hrModel(
						// 	trx
						// ).getSingleDeduction({
						// 	id: deduction.deduction_id,
						// 	hotel_code,
						// });

						// if (!isDeductionExists) {
						// 	throw new CustomError(
						// 		this.ResMsg.HTTP_NOT_FOUND,
						// 		this.StatusCode.HTTP_NOT_FOUND
						// 	);
						// }

						const amount = Number(deduction.amount);
						totalDeductions = totalDeductions + amount;

						return {
							employee_id: isEmployeeExists.id,
							deduction_name: deduction.deduction_name,
							amount,
						};
					})
				);
			}
			console.log({ totalDeductions });
			// 🔹 Handle Allowances
			let allowancesPayload: any[] = [];
			if (allowances_parse.length) {
				allowancesPayload = await Promise.all(
					allowances_parse.map(async (allowance: any) => {
						const isAllowanceExists = await this.Model.hrModel(
							trx
						).getSingleAllowance({
							id: allowance.allowance_id,
							hotel_code,
						});

						if (!isAllowanceExists) {
							throw new CustomError(
								this.ResMsg.HTTP_NOT_FOUND,
								this.StatusCode.HTTP_NOT_FOUND
							);
						}

						const amount = Number(allowance.amount);
						totalAllowances = totalAllowances + amount;

						return {
							employee_id: isEmployeeExists.id,
							allowance_id: allowance.allowance_id,
							amount,
						};
					})
				);
			}

			const grossSalary =
				Number(rest.payable_days * rest.daily_rate) + totalAllowances;
			console.log({ grossSalary });
			const netSalary = grossSalary - totalDeductions;

			const payload = {
				employee_id: rest.employee_id,
				account_id,
				basic_salary: rest.basic_salary,
				total_allowance: totalAllowances,
				total_deduction: totalDeductions,
				net_salary: netSalary,
				gross_salary: grossSalary,
				unpaid_leave_deduction: expectedUnpaidDeduction || 0,
				docs: rest.docs || null,
				leave_days: rest.leave_days || 0,
				unpaid_leave_days: rest.unpaid_leave_days || 0,
				note: rest.note || null,
				salary_basis: rest.salary_basis,
				total_days: rest.total_days,
				payable_days: rest.payable_days,
				daily_rate: rest.daily_rate,
				salary_date: rest.salary_date,
				created_by: id,
				hotel_code,
			};
			console.log({ payload });
			const res = await model.CreatePayRoll(payload);
			const payroll_id = res[0]?.id;

			if (deductionsPayload.length) {
				const deductionsWithPayrollId = deductionsPayload.map((d) => ({
					...d,
					payroll_id,
				}));
				await model.createEmployeeDeductions(deductionsWithPayrollId);
			}

			if (expectedUnpaidDeduction) {
				await model.createEmployeeDeductions([
					{
						employee_id: rest.employee_id,
						amount: expectedUnpaidDeduction,
						deduction_name: "Unpaid Leave Deduction",
						payroll_id,
					},
				]);
			}

			if (allowancesPayload.length) {
				const allowancesWithPayrollId = allowancesPayload.map((a) => ({
					...a,
					payroll_id,
				}));
				await model.createEmployeeAllowances(allowancesWithPayrollId);
			}

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
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: `The requested payroll with ID: ${id} not found.`,
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data,
		};
	}
}
export default PayRollService;
