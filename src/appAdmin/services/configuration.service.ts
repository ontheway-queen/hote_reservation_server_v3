import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";

class ConfigurationService extends AbstractServices {
	constructor() {
		super();
	}

	// ======================= Shift ======================= //
	public async createShift(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const body = req.body;
			body.hotel_code = hotel_code;

			const hrConfigurationModel = this.Model.hrModel(trx);

			const { data } = await hrConfigurationModel.getAllShifts({
				name: body.name as string,
				hotel_code,
			});
			if (data.length > 0) {
				throw new CustomError(
					"Shift with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.createShift(body);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Shift has been created",
			};
		});
	}

	public async getAllShifts(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { name, limit, skip } = req.query;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const { data, total } = await hrConfigurationModel.getAllShifts({
				name: name as string,
				hotel_code,
				skip: Number(skip),
				limit: Number(limit),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Shifts fetched successfully",
				total,
				data,
			};
		});
	}

	public async getSingleShift(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleShift({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Shift not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Shift fetched successfully",
				data,
			};
		});
	}

	public async updateShift(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);
			const payload = req.body;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleShift({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Shift not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const { data: nameAlreadyExists } =
				await hrConfigurationModel.getAllShifts({
					name: payload.name as string,
					hotel_code,
				});
			if (nameAlreadyExists.length > 0) {
				throw new CustomError(
					"Shift with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.updateShift({ id, hotel_code, payload });

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Shift updated successfully",
			};
		});
	}

	public async deleteShift(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleShift({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Shift not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await hrConfigurationModel.deleteShift({ id, hotel_code });

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Shift deleted successfully",
			};
		});
	}

	// ======================= Allowances ======================= //
	public async createAllowances(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const body = req.body;
			body.hotel_code = hotel_code;

			const hrConfigurationModel = this.Model.hrModel(trx);

			const { data } = await hrConfigurationModel.getAllAllowances({
				name: body.name as string,
				hotel_code,
			});
			if (data.length > 0) {
				throw new CustomError(
					"Allowances with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.createAllowances(body);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Shift has been created",
			};
		});
	}

	public async getAllAllowances(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { name } = req.query;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const { data, total } = await hrConfigurationModel.getAllAllowances(
				{
					name: name as string,
					hotel_code,
				}
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Allowances fetched successfully",
				total,
				data,
			};
		});
	}

	public async getSingleAllowance(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleAllowance({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Allowance not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Allowance fetched successfully",
				data,
			};
		});
	}

	public async updateAllowance(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);
			const payload = req.body;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleAllowance({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Allowance not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const { data: nameAlreadyExists } =
				await hrConfigurationModel.getAllAllowances({
					name: payload.name as string,
					hotel_code,
				});
			if (nameAlreadyExists.length > 0) {
				throw new CustomError(
					"Allowance with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.updateAllowance({
				id,
				hotel_code,
				payload,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Allowance updated successfully",
			};
		});
	}

	public async deleteAllowance(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleAllowance({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Allowance not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await hrConfigurationModel.deleteAllowance({ id, hotel_code });

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Allowance deleted successfully",
			};
		});
	}

	// ======================= Deductions ======================= //
	public async createDeductions(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const body = req.body;
			body.hotel_code = hotel_code;

			const hrConfigurationModel = this.Model.hrModel(trx);

			const { data } = await hrConfigurationModel.getAllDeductions({
				name: body.name as string,
				hotel_code,
			});
			if (data.length > 0) {
				throw new CustomError(
					"Deduction with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.createDeductions(body);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Deduction has been created",
			};
		});
	}

	public async getAllDeductions(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { name } = req.query;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const { data, total } = await hrConfigurationModel.getAllDeductions(
				{
					name: name as string,
					hotel_code,
				}
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Deductions fetched successfully",
				total,
				data,
			};
		});
	}

	public async getSingleDeduction(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleDeduction({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Deduction not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Deduction fetched successfully",
				data,
			};
		});
	}

	public async updateDeduction(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);
			const payload = req.body;

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleDeduction({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Deduction not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const { data: nameAlreadyExists } =
				await hrConfigurationModel.getAllDeductions({
					name: payload.name as string,
					hotel_code,
				});
			if (nameAlreadyExists.length > 0) {
				throw new CustomError(
					"Deduction with this name already exists",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			await hrConfigurationModel.updateDeduction({
				id,
				hotel_code,
				payload,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Deduction updated successfully",
			};
		});
	}

	public async deleteDeduction(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const hrConfigurationModel = this.Model.hrModel(trx);
			const data = await hrConfigurationModel.getSingleDeduction({
				id,
				hotel_code,
			});

			if (!data) {
				throw new CustomError(
					"Deduction not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			await hrConfigurationModel.deleteDeduction({ id, hotel_code });

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Deduction deleted successfully",
			};
		});
	}
}
export default ConfigurationService;
