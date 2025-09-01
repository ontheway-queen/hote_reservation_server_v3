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
			const { deductions, allowances, service_charge, ...rest } =
				req.body;

			const files = (req.files as Express.Multer.File[]) || [];

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

			const deduction_parse = deductions ? JSON.parse(deductions) : [];
			const allowances_parse = allowances ? JSON.parse(allowances) : [];

			let totalDeductions = 0;
			let totalAllowances = 0;

			// 🔹 Handle Deductions
			let deductionsPayload: any[] = [];
			if (deduction_parse.length) {
				deductionsPayload = await Promise.all(
					deduction_parse.map(async (deduction: any) => {
						const isDeductionExists = await this.Model.hrModel(
							trx
						).getSingleDeduction({
							id: deduction.deduction_id,
							hotel_code,
						});

						if (!isDeductionExists) {
							throw new CustomError(
								this.ResMsg.HTTP_NOT_FOUND,
								this.StatusCode.HTTP_NOT_FOUND
							);
						}

						let amount: number;

						if (deduction.amount != null) {
							amount = Number(deduction.amount);
						} else {
							if (isDeductionExists.type === "fixed") {
								amount = Number(isDeductionExists.value);
							} else if (
								isDeductionExists.type === "percentage"
							) {
								amount =
									(Number(isEmployeeExists.salary) *
										Number(isDeductionExists.value)) /
									100;
							} else {
								throw new CustomError(
									`Unknown deduction type for id ${isDeductionExists.id}: ${isDeductionExists.type}`,
									this.StatusCode.HTTP_BAD_REQUEST
								);
							}
						}

						totalDeductions += amount;

						return {
							employee_id: isEmployeeExists.id,
							deduction_id: deduction.deduction_id,
							amount,
						};
					})
				);
			}

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

						let amount: number;

						if (allowance.amount != null) {
							amount = Number(allowance.amount);
						} else {
							if (isAllowanceExists.type === "fixed") {
								amount = Number(isAllowanceExists.value);
							} else if (
								isAllowanceExists.type === "percentage"
							) {
								amount =
									(Number(isEmployeeExists.salary) *
										Number(isAllowanceExists.value)) /
									100;
							} else {
								throw new CustomError(
									`Unknown allowance type for id ${isAllowanceExists.id}: ${isAllowanceExists.type}`,
									this.StatusCode.HTTP_NOT_FOUND
								);
							}
						}

						totalAllowances += amount;

						return {
							employee_id: isEmployeeExists.id,
							allowance_id: allowance.allowance_id,
							amount,
						};
					})
				);
			}

			let serviceChargeValue = 0;
			if (service_charge != null) {
				serviceChargeValue =
					(Number(isEmployeeExists.salary) * Number(service_charge)) /
					100;
			}

			const grossSalary =
				Number(isEmployeeExists.salary) + totalAllowances;
			const netSalary =
				grossSalary - totalDeductions - serviceChargeValue;

			const payload = {
				employee_id: rest.employee_id,
				month: rest.salary_date,
				basic_salary: Number(isEmployeeExists.salary),
				total_allowance: totalAllowances,
				total_overtime: 0,
				service_charge: serviceChargeValue,
				total_deduction: totalDeductions,
				net_salary: netSalary,
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

			if (allowancesPayload.length) {
				const allowancesWithPayrollId = allowancesPayload.map((a) => ({
					...a,
					payroll_id,
				}));
				await model.createEmployeeAllowances(allowancesWithPayrollId);
			}

			const service_charge_payload = {
				month: rest.salary_date,
				employee_id: rest.employee_id,
				percentage: service_charge,
				amount: serviceChargeValue,
				hotel_code,
				payroll_id,
			};

			await model.createServiceChargeDistribution(service_charge_payload);

			if (files.length) {
				const payslipPayload = {
					payroll_id,
					file_url: files[0].filename,
				};

				await model.insertPaySlip(payslipPayload);
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
