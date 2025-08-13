import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import UserService from "../services/user.service";
import BtocUserValidator from "../utils/validator/user.validator";

class UseController extends AbstractController {
	private userService = new UserService();
	private userValidator = new BtocUserValidator();

	constructor() {
		super();
	}

	// get profile
	public getProfile = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.userService.getProfile(req);
			res.status(code).json(data);
		}
	);

	// Update Profile
	public updateProfile = this.asyncWrapper.wrap(
		{ bodySchema: this.userValidator.updateProfile },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.userService.updateProfile(req);
			res.status(code).json(data);
		}
	);
}

export default UseController;
