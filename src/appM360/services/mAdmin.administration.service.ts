import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";

class MAdministrationService extends AbstractServices {
	constructor() {
		super();
	}

	// create admin
	public async createAdmin(req: Request) {
		const { password, ...rest } = req.body;
		const mAdmiministrationModel = this.Model.mAdmiministrationModel();
		const check = await mAdmiministrationModel.getSingleAdmin({
			email: req.body.email,
		});

		if (check.length) {
			return {
				success: false,
				code: this.StatusCode.HTTP_CONFLICT,
				message: "Email already exist",
			};
		}
		const files = (req.files as Express.Multer.File[]) || [];

		rest["password"] = await Lib.hashPass(password);
		rest["avatar"] = files?.length && files[0].filename;

		const res = await mAdmiministrationModel.insertUserAdmin(rest);

		if (res.length) {
			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
			};
		}

		return {
			success: false,
			code: this.StatusCode.HTTP_BAD_REQUEST,
			message: this.ResMsg.HTTP_BAD_REQUEST,
		};
	}

	// update admin
	public async updateAdmin(req: Request) {
		const adminModel = this.Model.mAdmiministrationModel();
		const check = await adminModel.getSingleAdmin({
			id: parseInt(req.params.id),
		});

		if (!check.length) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		const files = (req.files as Express.Multer.File[]) || [];

		req.body["avatar"] = files?.length && files[0].filename;

		await adminModel.updateAdmin(req.body, {
			id: parseInt(req.params.id),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: this.ResMsg.HTTP_SUCCESSFUL,
		};
	}

	// get all admin
	public async getAllAdmin(req: Request) {
		const { limit, skip, status } = req.query;

		const mAdmiministrationModel = this.Model.mAdmiministrationModel();

		const { data, total } = await mAdmiministrationModel.getAllAdmin(
			limit as string,
			skip as string,
			status as string
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			total,
			data,
		};
	}
}

export default MAdministrationService;
