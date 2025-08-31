import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class EmployeeDeductionsService extends AbstractServices {
	constructor() {
		super();
	}

	public async createEmployeeDeduction(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { employee_id, deductionIds } = req.body;
			const { hotel_code } = req.hotel_admin;

			const hrModel = this.Model.hrModel(trx);
			const employeeModel = this.Model.employeeModel();

			const employee = await employeeModel.getSingleEmployee(
				employee_id,
				hotel_code
			);
			if (!employee) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Employee not found",
				};
			}

			const deductionDetails = await hrModel.getDeductionsByIds(
				deductionIds,
				hotel_code
			);

			const employeeDeductionData = deductionIds.map((d: any) => {
				const deduction = deductionDetails.find((dd) => dd.id === d);
				if (!deduction) throw new Error(`Deduction ID ${d} not found`);

				let amount = deduction.value;

				if (deduction.type === "percentage") {
					amount = Math.round(
						(Number(employee.salary) * Number(deduction.value)) /
							100
					).toString();
				}

				return {
					employee_id,
					deduction_id: d,
					amount,
				};
			});

			await Promise.all(
				employeeDeductionData.map((data: any) =>
					hrModel.createEmployeeDeduction(data)
				)
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Employee Deductions have been created",
			};
		});
	}
}
export default EmployeeDeductionsService;
