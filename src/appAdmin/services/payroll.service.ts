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
			if (
				deduction_parse.some((obj: any) => Object.keys(obj).length > 0)
			) {
				deductionsPayload = await Promise.all(
					deduction_parse.map(async (deduction: any) => {
						const amount = Number(deduction.deduction_amount);
						totalDeductions = totalDeductions + amount;

						return {
							employee_id: isEmployeeExists.id,
							deduction_name: deduction.deduction_name,
							deduction_amount: amount,
						};
					})
				);
			}

			// 🔹 Handle Allowances
			let allowancesPayload: any[] = [];
			if (
				allowances_parse.some((obj: any) => Object.keys(obj).length > 0)
			) {
				allowancesPayload = await Promise.all(
					allowances_parse.map(async (allowance: any) => {
						const amount = Number(allowance.allowance_amount);
						totalAllowances = totalAllowances + amount;

						return {
							employee_id: isEmployeeExists.id,
							allowance_name: allowance.allowance_name,
							allowance_amount: amount,
						};
					})
				);
			}

			const grossSalary =
				Number(rest.payable_days) * Number(rest.daily_rate) +
					Number(totalAllowances) || 0;

			const netSalary = grossSalary - totalDeductions || 0;

			const payload = {
				employee_id: rest.employee_id,
				account_id,
				payment_method: rest.payment_method,
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

			const res = await model.CreatePayRoll(payload);
			const payroll_id = res[0]?.id;

			if (deductionsPayload.length) {
				const deductionsWithPayrollId = deductionsPayload.map((d) => ({
					...d,
					payroll_id,
				}));
				await model.createEmployeeDeductions(deductionsWithPayrollId);
			}

			// if (expectedUnpaidDeduction) {
			// 	await model.createEmployeeDeductions([
			// 		{
			// 			employee_id: rest.employee_id,
			// 			deduction_amount: expectedUnpaidDeduction,
			// 			deduction_name: "Unpaid Leave Deduction",
			// 			payroll_id,
			// 		},
			// 	]);
			// }

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

	public async updatePayRoll(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const {
				allowances,
				deductions,
				add_deductions,
				delete_deductions,
				add_allowances,
				delete_allowances,
				account_id,
				...rest
			} = req.body;

			const deductionsToAdd = add_deductions
				? JSON.parse(add_deductions)
				: [];
			const deductionsToDelete = delete_deductions
				? JSON.parse(delete_deductions)
				: [];
			const allowancesToAdd = add_allowances
				? JSON.parse(add_allowances)
				: [];
			const allowancesToDelete = delete_allowances
				? JSON.parse(delete_allowances)
				: [];

			const deductionsPayload = deductions ? JSON.parse(deductions) : [];
			const allowancesPayload = allowances ? JSON.parse(allowances) : [];

			const files = (req.files as Express.Multer.File[]) || [];
			files.forEach(
				({ fieldname, filename }) => (rest[fieldname] = filename)
			);

			const employeeModel = this.Model.employeeModel(trx);
			const model = this.Model.payRollModel(trx);
			const accountModel = this.Model.accountModel(trx);

			const existingPayroll = await model.getSinglePayRoll(
				parseInt(id),
				hotel_code
			);
			if (!existingPayroll) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Payroll not found",
				};
			}

			const employee = await employeeModel.getSingleEmployee(
				existingPayroll.employee_id,
				hotel_code
			);
			if (!employee) {
				throw new CustomError(
					"Employee not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const account = await accountModel.getSingleAccount({
				hotel_code,
				id: account_id,
			});
			if (!account.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}

			rest.daily_rate = Number(rest.basic_salary) / rest.total_days;
			rest.payable_days =
				Number(rest.total_days) -
				(Number(rest.leave_days || 0) +
					Number(rest.unpaid_leave_days || 0));

			rest.unpaid_leave_deduction =
				rest.daily_rate * Number(rest.unpaid_leave_days || 0);

			if (
				Number(rest.total_days) !==
				rest.payable_days +
					Number(rest.leave_days || 0) +
					Number(rest.unpaid_leave_days || 0)
			) {
				throw new CustomError(
					"Total days mismatch!",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			let totalDeductions = 0;
			let totalAllowances = 0;

			if (deductionsToDelete.length) {
				await model.deleteEmployeeDeductionsNotIn({
					payroll_id: Number(id),
					ids: deductionsToDelete,
				});
			}

			if (allowancesToDelete.length) {
				await model.deleteEmployeeAllowancesNotIn({
					payroll_id: Number(id),
					ids: [allowancesToDelete],
				});
			}

			if (deductionsToAdd.length) {
				for (const d of deductionsToAdd) {
					const amount = Number(d.deduction_amount || 0);
					totalDeductions += amount;

					await model.createEmployeeDeductions([
						{
							payroll_id: Number(id),
							employee_id: existingPayroll.employee_id,
							deduction_name: d.deduction_name,
							deduction_amount: amount,
						},
					]);
				}
			}

			if (allowancesToAdd.length) {
				for (const a of allowancesToAdd) {
					const amount = Number(a.allowance_amount || 0);
					totalAllowances += amount;

					await model.createEmployeeAllowances([
						{
							payroll_id: Number(id),
							employee_id: existingPayroll.employee_id,
							allowance_name: a.allowance_name,
							allowance_amount: amount,
						},
					]);
				}
			}

			if (allowancesPayload.length) {
				for (const a of allowancesPayload) {
					const amount = Number(a.allowance_amount || 0);
					totalAllowances += amount;
					await model.updateEmployeeAllowances({
						id: a.id,
						payload: {
							allowance_name: a.allowance_name,
							allowance_amount: amount,
						},
					});
				}
			}

			if (deductionsPayload.length) {
				for (const d of deductionsPayload) {
					const amount = Number(d.deduction_amount || 0);
					totalDeductions += amount;
					await model.updateEmployeeDeductions({
						id: d.id,
						payload: {
							deduction_name: d.deduction_name,
							deduction_amount: amount,
						},
					});
				}
			}

			// Recalculate salaries
			const grossSalary =
				rest.payable_days * rest.daily_rate +
				(Number(totalAllowances) || 0);
			const netSalary =
				Number(grossSalary) - (Number(totalDeductions) || 0);

			const payload = {
				...rest,
				account_id,
				total_allowance: totalAllowances,
				total_deduction: totalDeductions,
				gross_salary: grossSalary,
				net_salary: netSalary,
				updated_by: admin_id,
				hotel_code,
			};

			await model.updatePayRoll({ id: parseInt(id), payload });

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Payroll updated successfully.",
			};
		});
	}

	public async deletePayRoll(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { hotel_code, id: admin_id } = req.hotel_admin;

			const model = this.Model.payRollModel(trx);

			const existingPayroll = await model.getSinglePayRoll(
				parseInt(id),
				hotel_code
			);
			if (!existingPayroll) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Payroll not found",
				};
			}

			await model.updatePayRoll({
				id: parseInt(id),
				payload: {
					is_deleted: true,
					deleted_by: admin_id,
					deleted_at: new Date(),
				},
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Payroll deleted successfully",
			};
		});
	}
}
export default PayRollService;
