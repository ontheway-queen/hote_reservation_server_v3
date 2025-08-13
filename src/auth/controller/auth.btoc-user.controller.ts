import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import BtocUserAuthService from "../services/auth.btoc-user.service";
import { BtocUserAuthValidator } from "../utils/validator/auth.btoc-user.validator";
import CommonService from "../../common/services/commonServices";

class BtocUserAuthController extends AbstractController {
	private btocUserAuthService = new BtocUserAuthService();
	private btocUserAuthValidator = new BtocUserAuthValidator();
	private commonService = new CommonService();

	constructor() {
		super();
	}

	// registration
	public registration = this.asyncWrapper.wrap(
		{ bodySchema: this.btocUserAuthValidator.registrationValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.btocUserAuthService.registration(req);
			res.status(code).json(data);
		}
	);

	// login
	public login = this.asyncWrapper.wrap(
		{ bodySchema: this.btocUserAuthValidator.loginValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.btocUserAuthService.login(req);
			res.status(code).json(data);
		}
	);

	// forget password
	public forgetPassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.forgetPasswordValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.btocUserAuthService.forgetPassword(req);
			res.status(code).json(data);
		}
	);

	// change password
	public changePassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.changePasswordValidator },
		async (req: Request, res: Response) => {
			const { old_password, new_password } = req.body;
			const { user_id } = req.btoc_user;
			const table = "users";
			const passField = "password";
			const userIdField = "id";
			const schema = "btoc";
			const { code, ...data } =
				await this.commonService.userPasswordVerify({
					table,
					oldPassword: old_password,
					passField,
					userId: user_id,
					userIdField,
					schema,
				});
			if (data.success) {
				const { code, ...data } =
					await this.commonService.changePassword({
						password: new_password,
						table,
						passField,
						userId: user_id,
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
