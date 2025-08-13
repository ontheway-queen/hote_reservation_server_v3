import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import BtocUserValidator from "../utils/validator/user.validator";
import UserProfileService from "../services/userProfile.service";

class UseProfileController extends AbstractController {
	private userProfileService = new UserProfileService();
	private userValidator = new BtocUserValidator();

	constructor() {
		super();
	}

	// get profile
	public getProfile = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.userProfileService.getProfile(
				req
			);
			res.status(code).json(data);
		}
	);

	// Update Profile
	public updateProfile = this.asyncWrapper.wrap(
		{ bodySchema: this.userValidator.updateProfile },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.userProfileService.updateProfile(req);
			res.status(code).json(data);
		}
	);
}

export default UseProfileController;
