import { Request, Response } from "express";

import AbstractController from "../../abstarcts/abstract.controller";
import AuthHotelRestaurantAdminService from "../services/auth.hotel-restaurant-admin.service";
import AuthHotelRestaurantAdminValidator from "../utils/validator/auth.hotel-restaurant-admin.validator";

class AuthHotelRestaurantAdminController extends AbstractController {
	private service = new AuthHotelRestaurantAdminService();
	private validator = new AuthHotelRestaurantAdminValidator();

	constructor() {
		super();
	}

	public login = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.loginValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.login(req);
			res.status(code).json(data);
		}
	);

	public getProfile = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getProfile(req);
			res.status(code).json(data);
		}
	);

	public updateProfile = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.updateProfileValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateProfile(req);
			res.status(code).json(data);
		}
	);

	public changeAdminPassword = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.changePasswordValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.changeAdminPassword(
				req
			);
			res.status(code).json(data);
		}
	);

	public resetForgetPassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.forgetPasswordValidator },
		async (req: Request, res: Response) => {
			const { token, email, password } = req.body;

			const { code, ...data } = await this.service.resetForgetPassword({
				token,
				email,
				password,
			});
			res.status(code).json(data);
		}
	);
}

export default AuthHotelRestaurantAdminController;
