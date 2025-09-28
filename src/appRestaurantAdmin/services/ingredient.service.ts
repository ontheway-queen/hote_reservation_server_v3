import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IIngredientRequest } from "../utils/interface/ingredient.interface";

class RestaurantIngredientService extends AbstractServices {
	constructor() {
		super();
	}

	public async createMeasurement(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as IIngredientRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isMeasurementExists = await restaurantModel.getMeasurements({
				hotel_code,
				restaurant_id,
				id: body.measurement_id,
			});

			if (isMeasurementExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Measurement not found.",
				};
			}

			await restaurantModel.createIngredient({
				...body,
				hotel_code,
				restaurant_id,
				created_by: id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Ingredient created successfully.",
			};
		});
	}

	public async getIngredients(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name } = req.query;

		const data = await this.Model.restaurantModel().getIngredients({
			hotel_code,
			restaurant_id,
			limit: Number(limit),
			skip: Number(skip),
			name: name as string,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async updateIngredient(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as Partial<IIngredientRequest>;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isIngredientExists = await restaurantModel.getIngredients({
				id: parseInt(id),
				hotel_code,
				restaurant_id,
			});

			if (isIngredientExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Ingredient not found.",
				};
			}

			if (body.measurement_id) {
				const isMeasurementExists =
					await restaurantModel.getMeasurements({
						hotel_code,
						restaurant_id,
						id: body.measurement_id,
					});

				if (isMeasurementExists.data.length === 0) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Measurement not found.",
					};
				}
			}

			await restaurantModel.updateIngredient({
				id: Number(id),
				payload: body,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Ingredient updated successfully.",
			};
		});
	}

	public async deleteIngredient(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isIngredientExists = await restaurantModel.getIngredients({
				id: parseInt(id),
				hotel_code,
				restaurant_id,
			});

			if (isIngredientExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Ingredient not found.",
				};
			}

			await restaurantModel.deleteIngredient({
				id: Number(id),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Ingredient deleted successfully.",
			};
		});
	}
}

export default RestaurantIngredientService;
