import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";
import { IFoodRequest } from "../utils/interface/food.interface";

class RestaurantFoodService extends AbstractServices {
	constructor() {
		super();
	}

	public async createFood(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;

			const food = (req.body as any).food as IFoodRequest;
			const ingredients = (req.body as any).ingredients as {
				product_id: number;
				quantity_per_unit: number;
			}[];

			const files = (req.files as Express.Multer.File[]) || [];
			if (Array.isArray(files)) {
				for (const file of files) {
					food.photo = file.filename;
				}
			}

			const restaurantMenuCategoryModel =
				this.restaurantModel.restaurantCategoryModel(trx);
			const restaurantUnitModel =
				this.restaurantModel.restaurantUnitModel(trx);
			const restaurantFoodModel =
				this.restaurantModel.restaurantFoodModel(trx);
			const inventoryModel = this.Model.inventoryModel(trx);

			const isMenuCategoryExists =
				await restaurantMenuCategoryModel.getMenuCategories({
					hotel_code,
					restaurant_id,
					id: food.menu_category_id,
				});

			if (isMenuCategoryExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Menu Category not found.",
				};
			}

			const isUnitExists = await restaurantUnitModel.getUnits({
				hotel_code,
				restaurant_id,
				id: food.unit_id,
			});

			if (isUnitExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Unit not found.",
				};
			}

			const newFoodId = await restaurantFoodModel.createFood({
				name: food.name,
				photo: food.photo,
				menu_category_id: food.menu_category_id,
				unit_id: food.unit_id,
				retail_price: food.retail_price,
				measurement_per_unit: food.measurement_per_unit,
				hotel_code,
				restaurant_id,
				created_by: id,
			});

			for (const ingredient of ingredients) {
				const { data: isProductExists } =
					await inventoryModel.getAllProduct({
						hotel_code,
						pd_ids: [ingredient.product_id],
					});

				if (isProductExists.length === 0) {
					throw new CustomError(
						"Product not found in the inventory.",
						this.StatusCode.HTTP_NOT_FOUND
					);
				}

				await restaurantFoodModel.insertFoodIngredients({
					food_id: newFoodId[0].id,
					product_id: ingredient.product_id,
					quantity_per_unit: ingredient.quantity_per_unit,
				});
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Food created successfully.",
			};
		});
	}

	public async getFoods(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name, category_id } = req.query;

		const data = await this.restaurantModel.restaurantFoodModel().getFoods({
			hotel_code,
			restaurant_id,
			limit: Number(limit),
			skip: Number(skip),
			name: name as string,
			menu_category_id: Number(category_id),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async getFood(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { id } = req.params;

		const data = await this.restaurantModel.restaurantFoodModel().getFood({
			hotel_code,
			restaurant_id,
			id: Number(id),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async updateFood(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const food = (req.body as any).food as Partial<IFoodRequest>;
			const ingredients = (req.body as any).ingredients as
				| {
						product_id: number;
						quantity_per_unit: number;
				  }[]
				| [];
			const remove_ingredients = (req.body as any).remove_ingredients as
				| number[]
				| [];

			const files = (req.files as Express.Multer.File[]) || [];
			if (Array.isArray(files)) {
				for (const file of files) {
					food.photo = file.filename;
				}
			}
			console.log(1);
			const restaurantFoodModel =
				this.restaurantModel.restaurantFoodModel(trx);
			const restaurantCategoryModel =
				this.restaurantModel.restaurantCategoryModel(trx);
			const restaurantUnitModel =
				this.restaurantModel.restaurantUnitModel(trx);
			const inventoryModel = this.Model.inventoryModel(trx);

			const isFoodExists = await restaurantFoodModel.getFood({
				id: Number(id),
				hotel_code,
				restaurant_id,
			});

			if (!isFoodExists) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Food not found.",
				};
			}

			if (food?.menu_category_id) {
				const isMenuCategoryExists =
					await restaurantCategoryModel.getMenuCategories({
						hotel_code,
						restaurant_id,
						id: food.menu_category_id,
					});

				if (isMenuCategoryExists.data.length === 0) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Menu Category not found.",
					};
				}
			}

			if (food?.unit_id) {
				const isUnitExists = await restaurantUnitModel.getUnits({
					hotel_code,
					restaurant_id,
					id: food.unit_id,
				});

				if (isUnitExists.data.length === 0) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Unit not found.",
					};
				}
			}

			if (Array.isArray(ingredients) && ingredients.length > 0) {
				for (const ingredient of ingredients) {
					const isIngredientsExistsInFood =
						await restaurantFoodModel.getFoodIngredients({
							food_id: isFoodExists.id,
							product_id: ingredient.product_id,
						});

					if (isIngredientsExistsInFood.length > 0) {
						await restaurantFoodModel.updateFoodIngredients({
							where: {
								product_id: ingredient.product_id,
								food_id: isFoodExists.id,
							},
							payload: {
								quantity_per_unit: ingredient.quantity_per_unit,
							},
						});
					} else {
						const { data: isIngredientsExists } =
							await inventoryModel.getAllProduct({
								hotel_code,
								pd_ids: [ingredient.product_id],
							});

						if (isIngredientsExists.length === 0) {
							throw new CustomError(
								"Ingredients not found in inventory",
								this.StatusCode.HTTP_NOT_FOUND
							);
						}

						await restaurantFoodModel.insertFoodIngredients({
							food_id: isFoodExists.id,
							product_id: ingredient.product_id,
							quantity_per_unit: ingredient.quantity_per_unit,
						});
					}
				}
			}

			if (
				Array.isArray(remove_ingredients) &&
				remove_ingredients.length > 0
			) {
				for (const id of remove_ingredients) {
					const isDeleted =
						await restaurantFoodModel.deleteFoodIngredients({
							id: id,
							food_id: isFoodExists.id,
						});
					if (isDeleted === 0) {
						throw new CustomError(
							"Ingredient not found for this food.",
							this.StatusCode.HTTP_BAD_REQUEST
						);
					}
				}
			}

			if (food) {
				await restaurantFoodModel.updateFood({
					where: { id: parseInt(id) },
					payload: food,
				});
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Food updated successfully.",
			};
		});
	}

	public async deleteFood(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantFoodModel =
				this.restaurantModel.restaurantFoodModel(trx);

			const isFoodExists = await restaurantFoodModel.getFoods({
				id: parseInt(id),
				hotel_code,
				restaurant_id,
			});

			if (isFoodExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Food not found.",
				};
			}

			await restaurantFoodModel.deleteFood({
				id: Number(id),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Food deleted successfully.",
			};
		});
	}
}

export default RestaurantFoodService;
