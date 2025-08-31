import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class EmployeeAllowancesService extends AbstractServices {
	constructor() {
		super();
	}

	public async createEmployeeAllowance(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { employee_id, allowanceIds } = req.body;
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
			console.log({ salary: employee.salary });
			// return;
			const allowanceDetails = await hrModel.getAllowancesByIds(
				allowanceIds,
				hotel_code
			);

			const employeeAllowanceData = allowanceIds.map((a: any) => {
				const allowance = allowanceDetails.find((ad) => ad.id === a);
				if (!allowance) throw new Error(`Allowance ID ${a} not found`);

				let amount = allowance.value;

				if (allowance.type === "percentage") {
					amount = Math.round(
						(Number(employee.salary) * Number(allowance.value)) /
							100
					).toString();
				}

				return {
					employee_id,
					allowance_id: a,
					amount,
				};
			});

			await Promise.all(
				employeeAllowanceData.map((data: any) =>
					hrModel.createEmployeeAllowance(data)
				)
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Employee Allowances have been created",
			};
		});
	}
}
export default EmployeeAllowancesService;
