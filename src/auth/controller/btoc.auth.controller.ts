import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";

import CommonService from "../../common/services/commonServices";
import BtocUserAuthService from "../services/btoc.auth.service";
import { BtocUserAuthValidator } from "../../btoc/utills/validators/user.auth.validator";

class BtocUserAuthController extends AbstractController {
	private service = new BtocUserAuthService();
	private validator = new BtocUserAuthValidator();
	private commonService = new CommonService();

	constructor() {
		super();
	}

	// registration
	public registration = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.registrationValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.registration(req);
			res.status(code).json(data);
		}
	);

	// login
	public login = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.loginValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.login(req);
			res.status(code).json(data);
		}
	);

	// forget password
	public forgetPassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.forgetPasswordValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.forgetPassword(req);
			res.status(code).json(data);
		}
	);

	// change password
	public changePassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.changePasswordValidator },
		async (req: Request, res: Response) => {
			const { old_password, new_password } = req.body;
			const { id } = req.btoc_user;
			const table = "users";
			const passField = "password";
			const userIdField = "id";
			const schema = "btoc";
			const { code, ...data } =
				await this.commonService.userPasswordVerify({
					table,
					oldPassword: old_password,
					passField,
					userId: id,
					userIdField,
					schema,
				});
			if (data.success) {
				const { code, ...data } =
					await this.commonService.changePassword({
						password: new_password,
						table,
						passField,
						userId: id,
						userIdField,
						schema,
					});
				res.status(code).json(data);
			} else {
				res.status(code).json(data);
			}
		}
	);
}

export default BtocUserAuthController;
