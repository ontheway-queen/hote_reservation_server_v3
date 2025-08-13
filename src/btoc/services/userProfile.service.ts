import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";

class UserProfileService extends AbstractServices {
	constructor() {
		super();
	}

	// registration
	public async getProfile(req: Request) {
		const { user_id } = req.btoc_user;
		const model = this.Model.btocModel().UserProfileModel();

		const userProfile = await model.getProfile({ id: user_id });
		if (!userProfile) {
			throw new CustomError(
				"User not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "User registration successful",
			data: userProfile,
		};
	}

	// update profile
	public async updateProfile(req: Request) {
		console.log({ test: req.btoc_user });
		const { email } = req.btoc_user;
		const payload = req.body;
		const files = req.upFiles;
		const model = this.Model.btocModel().UserProfileModel();
		const isUserExists = await model.checkUser({ email });
		if (!isUserExists) {
			throw new CustomError(
				"User not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		const modifiedPayload = {
			...payload,
			photo: files && files.length > 0 ? files[0] : null,
		};

		await model.updateProfile({
			id: isUserExists.id,
			payload: modifiedPayload,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Profile update successful",
		};
	}
}

export default UserProfileService;
