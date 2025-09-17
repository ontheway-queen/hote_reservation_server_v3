import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class InventoryService extends AbstractServices {
	constructor() {
		super();
	}

	public async getInventoryDetailsService(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, key } = req.query;

		const model = this.Model.inventoryModel();

		const { data, total } = await model.getInventoryDetails({
			key: key as string,
			limit: Number(limit),
			skip: Number(skip),
			hotel_code,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getSingleInventoryDetailsService(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;

		const model = this.Model.inventoryModel();
		const data = await model.getSingleInventoryDetails({
			id: parseInt(id),
			hotel_code,
		});

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}
}
export default InventoryService;
