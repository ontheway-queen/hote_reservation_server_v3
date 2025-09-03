import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import config from "../../config/config";
import Lib from "../../utils/lib/lib";
import { OTP_TYPE_FORGET_BTOC_USER } from "../../utils/miscellaneous/constants";
import ThirdPartyAuth from "./thirdPartyAuth";

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
		const { email, password } = req.body;
		const model = this.Model.btocUserModel();
		const user = await model.getSingleUser({ email });
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
			gender: user.gender,
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

	public async loginWithGoogle(req: Request) {
		return this.db.transaction(async (trx) => {
			const { hotel_code } = req.web_token;
			const { access_token } = req.body;

			if (!access_token) {
				return {
					success: false,
					code: this.StatusCode.HTTP_UNAUTHORIZED,
					message: "Access token required",
				};
			}

			// Verify Google access token
			const verified_user =
				await new ThirdPartyAuth().verifyGoogleAccessToken(
					access_token
				);
			console.log({ verified_user });
			const model = this.Model.btocUserModel(trx);

			const check_user = await model.getSingleUser({
				email: verified_user.email,
			});
			console.log({ check_user });
			let userID = check_user?.id || 0;

			if (!check_user) {
				const registration = await model.createUser({
					email: verified_user.email,
					first_name: verified_user.given_name,
					last_name: verified_user.family_name,
					hotel_code,
				});

				userID = registration[0].id;
			}

			const tokenPayload = {
				id: userID,
				first_name: verified_user.given_name,
				last_name: verified_user.family_name,
				hotel_code,
				email: verified_user.email,
				status: "active",
				type: "btoc_user",
			};

			const token = Lib.createToken(
				tokenPayload,
				config.JWT_SECRET_H_USER,
				"48h"
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
				data: { ...tokenPayload },
				token,
			};
		});
	}

	public async getProfile(req: Request) {
		const { id, hotel_code } = req.btoc_user;

		console.log({ btoc: req.btoc_user });

		const reservationModel = this.Model.btocUserModel();
		const data = await reservationModel.getSingleUser({ id });
		console.log({ data });
		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		const { password, ...rest } = data;

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: {
				...rest,
			},
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

		const { email: verifyEmail, type } = tokenVerify;
		if (email === verifyEmail && type === OTP_TYPE_FORGET_BTOC_USER) {
			const hashPass = await Lib.hashPass(password);
			const model = this.Model.btocUserModel();
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
