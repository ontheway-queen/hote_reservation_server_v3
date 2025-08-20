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
		const { hotel_code } = req.web_token;
		const { email, password, ...rest } = req.body;
		const files = req.upFiles;
		const model = this.Model.btocUserModel();

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
			hotel_code,
			password: hashedPassword,
			photo: photoUrl,
			...rest,
		};
		const createdUser = await model.createUser(newUserData);

		const tokenPayload = {
			id: createdUser[0].id,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			phone: req.body.phone,
			status: "active",
			date_of_birth: req.body.date_of_birth,
			gender: req.body.gender,
			type: "btoc_user",
		};

		const token = Lib.createToken(
			tokenPayload,
			config.JWT_SECRET_H_USER,
			"24h"
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "User registration successful",
			token,
			data: {
				id: createdUser[0].id,
				email: createdUser[0].email,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				phone: req.body.phone,
				status: "active",
				date_of_birth: req.body.date_of_birth,
				gender: req.body.gender,
			},
		};
	}

	// Login
	public async login(req: Request) {
		const { hotel_code } = req.web_token;
		const { email, password } = req.body;
		const model = this.Model.btocUserModel();
		const user = await model.checkUser({ email });
		if (!user) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: this.ResMsg.HTTP_UNAUTHORIZED,
			};
		}

		if (user.status !== "active") {
			return {
				success: false,
				code: this.StatusCode.HTTP_FORBIDDEN,
				message: `Your account is ${user.status}. Please contact support.`,
			};
		}

		const { password: hashPass, is_deleted, ...rest } = user;
		console.log({ user });

		const isPasswordValid = await Lib.compare(password, hashPass);
		if (!isPasswordValid) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: "Wrong password.",
			};
		}

		const tokenPayload = {
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			phone: user.phone,
			status: user.status,
			date_of_birth: user.date_of_birth,
			gender: user.status,
			type: "btoc_user",
		};

		const token = Lib.createToken(
			tokenPayload,
			config.JWT_SECRET_H_USER,
			"24h"
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Successfully Logged In",
			data: rest,
			token,
		};
	}

	// forget
	public async forgetPassword(req: Request) {
		const { token, email, password } = req.body;
		const tokenVerify: any = Lib.verifyToken(
			token,
			config.JWT_SECRET_H_USER
		);
		if (!tokenVerify) {
			return {
				success: false,
				code: this.StatusCode.HTTP_UNAUTHORIZED,
				message: this.ResMsg.HTTP_UNAUTHORIZED,
			};
		}

		console.log({ btoc: req.btoc_user });

		const reservationModel = this.Model.btocUserModel();
		const data = await reservationModel.getSingleUser({
			email,
		});
		console.log({ data });
		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
		};
	}
}

export default BtocUserAuthService;
