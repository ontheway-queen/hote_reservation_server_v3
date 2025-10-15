import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantStaffService from "../services/staff.service";
import RestaurantStaffValidator from "../utils/validator/staff.validator";

class RestaurantStaffController extends AbstractController {
	private validator = new RestaurantStaffValidator();
	private service = new RestaurantStaffService();

	constructor() {
		super();
	}

	public getAllStaffs = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getStaffsValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllStaffs(req);
			res.status(code).json(data);
		}
	);

	public getSingleStaff = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleStaff(req);
			res.status(code).json(data);
		}
	);
}

export default RestaurantStaffController;
