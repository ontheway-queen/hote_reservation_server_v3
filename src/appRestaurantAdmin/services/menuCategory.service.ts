import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class RestaurantMenuCategoryService extends AbstractServices {
	constructor() {
		super();
	}

	public async createMenuCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as { name: string };

			const isCategoryExists =
				await this.Model.restaurantModel().getMenuCategories({
					hotel_code,
					restaurant_id,
					name: body.name as string,
				});

			if (isCategoryExists.data.length > 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Menu Category already exists.",
				};
			}

			const restaurantModel = this.Model.restaurantModel(trx);

			await restaurantModel.createMenuCategory({
				...body,
				hotel_code,
				created_by: id,
				restaurant_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Menu Category created successfully.",
			};
		});
	}

	public async getMenuCategories(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name, status } = req.query;

		const data = await this.Model.restaurantModel().getMenuCategories({
			hotel_code,
			restaurant_id,
			limit: Number(limit),
			skip: Number(skip),
			name: name as string,
			status: status as string,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			...data,
		};
	}

	public async updateMenuCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as {
				name?: string;
				status?: string;
			};

			const restaurantModel = this.Model.restaurantModel(trx);

			const isCategoryExists = await restaurantModel.getMenuCategories({
				id: parseInt(id),
				hotel_code,
				restaurant_id,
			});

			if (isCategoryExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Menu Category not found.",
				};
			}

			const newCategory = await restaurantModel.updateMenuCategory({
				id: parseInt(id),
				payload: body,
			});

			if (!newCategory) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Menu Category not found.",
				};
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Menu Category updated successfully.",
			};
		});
	}

	public async deleteMenuCategory(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isCategoryExists = await restaurantModel.getMenuCategories({
				id: parseInt(id),
				hotel_code,
				restaurant_id,
			});

			if (isCategoryExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Menu Category not found.",
				};
			}

			const newCategory = await restaurantModel.deleteMenuCategory({
				id: parseInt(id),
			});

			if (!newCategory) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Menu Category not found.",
				};
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Menu Category deleted successfully.",
			};
		});
	}
}

export default RestaurantMenuCategoryService;
