import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	IUnitRequest,
	IUpdateUnitRequest,
} from "../utils/interface/unit.interface";

class RestaurantUnitService extends AbstractServices {
	constructor() {
		super();
	}

	public async createUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as IUnitRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			await restaurantModel.createUnit({
				...body,
				hotel_code,
				restaurant_id,
				created_by: id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Unit created successfully.",
			};
		});
	}

	public async getUnits(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name } = req.query;

		const data = await this.Model.restaurantModel().getUnits({
			hotel_code,
			restaurant_id,
			limit: Number(limit),
			skip: Number(skip),
			name: name as string,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_SUCCESSFUL,
			...data,
		};
	}

	public async updateUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as IUpdateUnitRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isUnitExists = await restaurantModel.getUnits({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isUnitExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Unit not found.",
				};
			}

			await restaurantModel.updateUnit({
				id: parseInt(id),
				payload: body,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Unit updated successfully.",
			};
		});
	}

	public async deleteUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isUnitExists = await restaurantModel.getUnits({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isUnitExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Unit not found.",
				};
			}

			await restaurantModel.deleteUnit({
				id: parseInt(id),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Unit deleted successfully.",
			};
		});
	}
}

export default RestaurantUnitService;
