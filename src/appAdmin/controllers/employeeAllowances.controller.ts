import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import EmployeeAllowancesService from "../services/employeeAllowances.service";

class EmployeeAllowancesController extends AbstractController {
	private service = new EmployeeAllowancesService();

	constructor() {
		super();
	}

	public createEmployeeAllowance = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.createEmployeeAllowance(req);
			res.status(code).json(data);
		}
	);
}

export default EmployeeAllowancesController;
