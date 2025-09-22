import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class ServiceCategoriesService extends AbstractServices {
	constructor() {
		super();
	}

	public async createServiceCategory(req: Request) {
		const { hotel_code, id } = req.hotel_admin;
		const { name } = req.body;

		const serviceCategoriesModel = this.Model.serviceCategoriesModel();

		const check = await serviceCategoriesModel.getServiceCategory({
			hotel_code,
			name,
		});

		if (check) {
			return {
				success: false,
				code: this.StatusCode.HTTP_CONFLICT,
				message: "Service Category name already exists",
			};
		}

		await serviceCategoriesModel.createServiceCategory({
			hotel_code,
			name,
			created_by: id,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: "Service Category has been created successfully!",
		};
	}

	public async getAllServiceCategories(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { key, limit, skip } = req.query;
		const serviceCategoriesModel = this.Model.serviceCategoriesModel();

		const data = await serviceCategoriesModel.getServiceCategories({
			key: key as string,
			limit: Number(limit),
			skip: Number(skip),
			hotel_code,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: "Service Categories has been fetched successfully!",
			...data,
		};
	}

	public async updateServiceCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const { name, ...rest } = req.body;

			const serviceCategoriesModel = this.Model.serviceCategoriesModel();

			if (name) {
				const check = await serviceCategoriesModel.getServiceCategory({
					hotel_code,
					name,
				});

				if (check) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Service Category name already exists",
					};
				}
			}

			await serviceCategoriesModel.updateServiceCategory(
				{
					id,
					hotel_code,
				},
				{ name, ...rest }
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Service Categories has been updated successfully!",
			};
		});
	}

	public async deleteServiceCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const id = Number(req.params.id);

			const serviceCategoriesModel = this.Model.serviceCategoriesModel();

			const check = await serviceCategoriesModel.getServiceCategory({
				hotel_code,
				id,
			});

			if (!check) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Service Category name does not exists",
				};
			}

			await serviceCategoriesModel.updateServiceCategory(
				{
					id,
					hotel_code,
				},
				{ is_deleted: true }
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Service Categories has been deleted successfully!",
			};
		});
	}
}
export default ServiceCategoriesService;
