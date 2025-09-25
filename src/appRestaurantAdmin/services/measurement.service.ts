import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	IMeasurementRequest,
	IUpdateMeasurementRequest,
} from "../utils/interface/measurement.interface";

class RestaurantMeasurementService extends AbstractServices {
	constructor() {
		super();
	}

	public async createMeasurement(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id, restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as IMeasurementRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			await restaurantModel.createMeasurement({
				...body,
				hotel_code,
				restaurant_id,
				created_by: id,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Measurement created successfully.",
			};
		});
	}

	public async getMeasurements(req: Request) {
		const { restaurant_id, hotel_code } = req.restaurant_admin;

		const { limit, skip, name } = req.query;

		const data = await this.Model.restaurantModel().getMeasurements({
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

	public async updateMeasurement(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;
			const body = req.body as IUpdateMeasurementRequest;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isMeasurementExists = await restaurantModel.getMeasurements({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isMeasurementExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Measurement not found.",
				};
			}

			const newMeasurement = await restaurantModel.updateMeasurement({
				id: parseInt(id),
				payload: body,
			});

			if (!newMeasurement) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Failed to update measurement.",
				};
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Measurement updated successfully.",
			};
		});
	}

	public async deleteMeasurement(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { id } = req.params;
			const { restaurant_id, hotel_code } = req.restaurant_admin;

			const restaurantModel = this.Model.restaurantModel(trx);

			const isMeasurementExists = await restaurantModel.getMeasurements({
				hotel_code,
				restaurant_id,
				id: parseInt(id),
			});

			if (isMeasurementExists.data.length === 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Measurement not found.",
				};
			}

			const newMeasurement = await restaurantModel.deleteMeasurement({
				id: parseInt(id),
			});

			if (!newMeasurement) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Failed to delete measurement.",
				};
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Measurement deleted successfully.",
			};
		});
	}
}

export default RestaurantMeasurementService;
