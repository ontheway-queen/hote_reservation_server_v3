import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import config from "../../config/config";
import Lib from "../../utils/lib/lib";
import { OTP_TYPE_FORGET_BTOC_USER } from "../../utils/miscellaneous/constants";

class BtocUserAuthService extends AbstractServices {
	constructor() {
		super();
	}

	// registration
	public async registration(req: Request) {
		const { email, password, ...rest } = req.body;
		const files = req.upFiles;
		const model = this.Model.btocModel().UserModel();

		const isUserExists = await model.checkUser({ email });
		if (isUserExists) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message:
					"An account with this email already exists. Please use a different email address and try again.",
			};
		}

		const hashedPassword = await Lib.hashPass(password);
		let photoUrl = null;
		if (files && files.length > 0) {
			photoUrl = files[0] || null;
		}

		const newUserData = {
			email,
			password: hashedPassword,
			photo: photoUrl,
			...rest,
		};
		const createdUser = await model.createUser(newUserData);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "User registration successful",
			data: {
				id: createdUser[0].id,
				email: createdUser[0].email,
			},
		};
	}

	// Login
	public async login(req: Request) {
		const { email, password } = req.body;
		const model = this.Model.btocModel().UserModel();
		const user = await model.checkUser({ email });
		if (!user) {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: "User not found with this email.",
			};
		}

		if (user.status !== "active") {
			return {
				success: false,
				code: this.StatusCode.HTTP_FORBIDDEN,
				message: `Your account is ${user.status}. Please contact support.`,
			};
		}

		const { password: hashPass, ...rest } = user;

		const isPasswordValid = await Lib.compare(password, hashPass);
		if (!isPasswordValid) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: "Wrong password.",
			};
		}

		const tokenPayload = {
			user_id: user.id,
			name: user.first_name + " " + user.last_name,
			email: user.email,
			phone: user.phone,
			status: user.status,
			date_of_birth: user.date_of_birth,
			gender: user.status,
			type: null,
		};

		const token = Lib.createToken(
			tokenPayload,
			config.JWT_SECRET_BTOC_USER,
			"24h"
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "User login successful",
			data: rest,
			token,
		};
	}

	// forget
	public async forgetPassword(req: Request) {
		const { token, email, password } = req.body;
		const tokenVerify: any = Lib.verifyToken(
			token,
			config.JWT_SECRET_BTOC_USER
		);

		if (!tokenVerify) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: this.ResMsg.HTTP_UNAUTHORIZED,
			};
		}

		const { email: verifyEmail, type } = tokenVerify;
		if (email === verifyEmail && type === OTP_TYPE_FORGET_BTOC_USER) {
			const hashPass = await Lib.hashPass(password);
			const model = this.Model.btocModel().UserModel();
			await model.updateProfile({
				payload: { password: hashPass },
				email,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		} else {
			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message: this.ResMsg.HTTP_BAD_REQUEST,
			};
		}
	}
}

export default BtocUserAuthService;
