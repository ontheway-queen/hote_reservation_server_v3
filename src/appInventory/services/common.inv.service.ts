import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	ICreateCommonInvPayload,
	IUpdateCommonInvPayload,
	IUpdateInvSupplierPayload,
} from "../utils/interfaces/common.inv.interface";

class CommonInvService extends AbstractServices {
	constructor() {
		super();
	}

	//=================== Category ======================//

	public async createCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { name } = req.body as ICreateCommonInvPayload;

			// Check for existing category
			const Model = this.Model.CommonInventoryModel(trx);

			const { data } = await Model.getAllCategory({
				name: req.body.name,
				hotel_code,
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Category name already exists",
				};
			}

			await Model.createCategory({
				hotel_code,
				name,
				created_by: admin_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Category created successfully.",
			};
		});
	}

	// Get all Category
	public async getAllCategory(req: Request) {
		const { limit, skip, name, status } = req.query;
		const { hotel_code } = req.hotel_admin;
		const model = this.Model.CommonInventoryModel();

		const { data, total } = await model.getAllCategory({
			name: name as string,
			status: status as string,
			limit: limit as string,
			skip: skip as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Update Category
	public async updateCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { id } = req.params;

			const updatePayload = req.body as IUpdateCommonInvPayload;

			const model = this.Model.CommonInventoryModel(trx);

			const { data } = await model.getAllCategory({
				name: updatePayload.name,
				hotel_code,
				excludeId: parseInt(req.params.id),
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Category name already exists",
				};
			}

			const res = await model.updateCategory(parseInt(id), {
				name: updatePayload.name,
				status: updatePayload.status,
			});

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Category updated successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Category didn't find  from this ID",
				};
			}
		});
	}

	// Delete Category
	public async deleteCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { hotel_code } = req.hotel_admin;
			const model = this.Model.CommonInventoryModel(trx);

			const { data } = await model.getAllCategory({
				hotel_code,
				excludeId: undefined,
				name: "",
			});

			const category = data.find((item) => item.id === Number(id));

			if (!category) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Category not found from this ID",
				};
			}

			// ✅ Soft delete
			await model.deleteCategory(Number(id), hotel_code);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Category deleted successfully",
			};
		});
	}

	//=================== Unit ======================//

	// create Unit
	public async createUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { name, short_code } = req.body as ICreateCommonInvPayload;

			// Category name check
			const Model = this.Model.CommonInventoryModel(trx);

			const { data } = await Model.getAllUnit({
				name,
				hotel_code,
				short_code,
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Unit name already exists",
				};
			}

			await Model.createUnit({
				hotel_code,
				name,
				short_code,
				created_by: admin_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Unit created successfully.",
			};
		});
	}

	// Get all Unit
	public async getAllUnit(req: Request) {
		const { limit, skip, name, status } = req.query;

		const { hotel_code } = req.hotel_admin;

		const model = this.Model.CommonInventoryModel();

		const { data, total } = await model.getAllUnit({
			name: name as string,
			status: status as string,
			limit: limit as string,
			skip: skip as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Update Unit
	public async updateUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { id } = req.params;

			const updatePayload = req.body as IUpdateCommonInvPayload;

			const model = this.Model.CommonInventoryModel(trx);

			const { data } = await model.getAllUnit({
				name: updatePayload.name,
				hotel_code,
				excludeId: parseInt(req.params.id),
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Unit name already exists",
				};
			}

			const res = await model.updateUnit(parseInt(id), hotel_code, {
				name: updatePayload.name,
				short_code: updatePayload.short_code,
				status: updatePayload.status,
			});

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Unit updated successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Unit didn't find  from this ID",
				};
			}
		});
	}

	//=================== Brand ======================//

	// create Unit
	public async createBrand(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { name } = req.body as ICreateCommonInvPayload;

			// Category name check
			const Model = this.Model.CommonInventoryModel(trx);

			const { data } = await Model.getAllBrand({ name, hotel_code });

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Brand name already exists",
				};
			}

			await Model.createBrand({
				hotel_code,
				name,
				created_by: admin_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Brand created successfully.",
			};
		});
	}

	// Get all Brand
	public async getAllBrand(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, name, status } = req.query;

		const model = this.Model.CommonInventoryModel();

		const { data, total } = await model.getAllBrand({
			hotel_code,
			name: name as string,
			status: status as string,
			limit: limit as string,
			skip: skip as string,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Update Brand
	public async updateBrand(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { id } = req.params;

			const updatePayload = req.body as IUpdateCommonInvPayload;

			const model = this.Model.CommonInventoryModel(trx);

			const { data } = await model.getAllBrand({
				name: updatePayload.name,
				hotel_code,
				excludeId: parseInt(req.params.id),
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Brand name already exists",
				};
			}

			const res = await model.updateBrand(parseInt(id), hotel_code, {
				name: updatePayload.name,
				status: updatePayload.status,
			});

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Brand updated successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Brand didn't find  from this ID",
				};
			}
		});
	}

	//=================== Supplier service ======================//

	// create Supplier
	public async createSupplier(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { name, phone } = req.body;

			// Supplier name check
			const Model = this.Model.CommonInventoryModel(trx);

			const { data } = await Model.getAllSupplier({ name, hotel_code });

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Supplier name already exists",
				};
			}

			await Model.createSupplier({
				hotel_code,
				name,
				phone,
				created_by: admin_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Supplier created successfully.",
			};
		});
	}

	// Get all Supplier
	public async getAllSupplier(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, name, status } = req.query;

		const model = this.Model.CommonInventoryModel();

		const { data, total } = await model.getAllSupplier({
			name: name as string,
			status: status as string,
			limit: limit as string,
			skip: skip as string,
			hotel_code,
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Get all Supplier Payment
	public async getAllSupplierPayment(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, key, from_date, to_date } = req.query;

		const { data, total } =
			await this.Model.CommonInventoryModel().getSupplierPayment({
				key: key as string,
				from_date: from_date as string,
				to_date: to_date as string,
				limit: limit as string,
				skip: skip as string,
				hotel_code,
			});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Supplier payment report
	public async getSupplierLedgerReport(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, from_date, to_date } = req.query;

		const data =
			await this.Model.CommonInventoryModel().getSupplierLedgerReport({
				limit: limit as string,
				skip: skip as string,
				from_date: from_date as string,
				to_date: to_date as string,
				id: parseInt(req.params.id),
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data[0],
		};
	}

	// Update Supplier
	public async updateSupplier(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const { id } = req.params;
			const updatePayload = req.body as IUpdateInvSupplierPayload;

			const model = this.Model.CommonInventoryModel(trx);

			const { data } = await model.getAllSupplier({
				name: updatePayload.name,
				hotel_code,
				excludeId: parseInt(req.params.id),
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Supplier name already exists",
				};
			}

			const res = await model.updateSupplier(parseInt(id), hotel_code, {
				name: updatePayload.name,
				phone: updatePayload.phone,
				status: updatePayload.status,
				updated_by: admin_id,
			});

			if (res === 1) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: "Supplier updated successfully",
				};
			} else {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Supplier not found with this ID",
				};
			}
		});
	}
}
export default CommonInvService;
