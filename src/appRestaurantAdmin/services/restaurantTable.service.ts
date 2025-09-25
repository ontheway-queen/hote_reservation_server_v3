import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { ICreateTableRequest } from "../utils/interface/table.interface";

class RestaurantTableService extends AbstractServices {
	constructor() {
		super();
	}

	public async createTable(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as ICreateTableRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isTableExists = await restaurantModel.getTables({
				hotel_code,
				restaurant_id,
				name: body.name,
			});

			if (isTableExists.data.length > 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Table already exists.",
				};
			}

			await restaurantModel.createTable({
				...body,
				hotel_code,
				created_by: id,
				restaurant_id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Table created successfully.",
			};
		});
	}

	public async getTables(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name, category, status } = req.query;

		const data = await this.Model.restaurantModel().getTables({
			hotel_code,
			restaurant_id,
			limit: Number(limit),
			skip: Number(skip),
			name: name as string,
			category: category as string,
			status: status as string,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			...data,
		};
	}

	public async updateTable(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const {
				id: user_id,
				restaurant_id,
				hotel_code,
			} = req.restaurant_admin;
			const body = req.body as Partial<ICreateTableRequest>;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isTableExists = await restaurantModel.getTables({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isTableExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Table not found.",
				};
			}

			if (body.name) {
				const { data } = await restaurantModel.getTables({
					name: body.name,
					hotel_code,
					restaurant_id,
				});

				if (data.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Table name already exists",
					};
				}
			}

			await restaurantModel.updateTable({
				id: Number(id),
				payload: {
					...body,
					updated_by: user_id,
				},
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Table updated successfully.",
			};
		});
	}

	public async deleteTable(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isTableExists = await restaurantModel.getTables({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isTableExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Table not found.",
				};
			}

			await restaurantModel.deleteTable({
				id: Number(id),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Table deleted successfully.",
			};
		});
	}
}

export default RestaurantTableService;
