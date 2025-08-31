import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import EmployeeDeductionsService from "../services/employeeDeductions.service";

class EmployeeDeductionsController extends AbstractController {
	private service = new EmployeeDeductionsService();

	constructor() {
		super();
	}

	public createEmployeeDeduction = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.createEmployeeDeduction(req);
			res.status(code).json(data);
		}
	);
}

export default EmployeeDeductionsController;
