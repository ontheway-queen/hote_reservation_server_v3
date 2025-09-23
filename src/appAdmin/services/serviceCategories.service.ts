import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";

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

		const category_code = await Lib.generateCategoryCode(hotel_code, name);

		await serviceCategoriesModel.createServiceCategory({
			hotel_code,
			name,
			created_by: id,
			category_code,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			message: "Service Category has been created successfully!",
		};
	}

	public async getAllServiceCategories(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { name, limit, skip, status } = req.query;
		const serviceCategoriesModel = this.Model.serviceCategoriesModel();

		const data = await serviceCategoriesModel.getServiceCategories({
			key: name as string,
			status: status as string,
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

			const category_code = await Lib.generateCategoryCode(
				hotel_code,
				name
			);

			await serviceCategoriesModel.updateServiceCategory(
				{
					id,
					hotel_code,
				},
				{ name, category_code, ...rest }
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
