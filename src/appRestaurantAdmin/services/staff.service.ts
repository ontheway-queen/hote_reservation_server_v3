import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class RestaurantStaffService extends AbstractServices {
	constructor() {
		super();
	}

	public async getSingleStaff(req: Request) {
		const { id } = req.params;
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const data = await this.restaurantModel
			.restaurantStaffModel()
			.getSingleStaff({
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

	public async getAllStaffs(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name } = req.query;

		const data = await this.restaurantModel
			.restaurantStaffModel()
			.getAllStaffs({
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

	public async updateUnit(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body;

			const restaurantUnitModel =
				this.restaurantModel.restaurantUnitModel(trx);

			const isUnitExists = await restaurantUnitModel.getUnits({
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

			await restaurantUnitModel.updateUnit({
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

			const restaurantUnitModel =
				this.restaurantModel.restaurantUnitModel(trx);

			const isUnitExists = await restaurantUnitModel.getUnits({
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

			await restaurantUnitModel.deleteUnit({
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

export default RestaurantStaffService;
