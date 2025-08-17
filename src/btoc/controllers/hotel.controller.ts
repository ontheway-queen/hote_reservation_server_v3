import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import { BtocHotelService } from "../services/hotel.service";

export class BtocHotelController extends AbstractController {
	private service = new BtocHotelService();

	constructor() {
		super();
	}

	public searchAvailability = this.asyncWrapper.wrap(
		{},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.searchAvailability(
				req
			);
			res.status(code).json(data);
		}
	);
}
