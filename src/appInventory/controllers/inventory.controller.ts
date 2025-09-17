import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import InventoryService from "../services/inventory.service";
import InventoryValidator from "../utils/validation/inventory.validator";

class InventoryController extends AbstractController {
	private service = new InventoryService();
	private validator = new InventoryValidator();

	constructor() {
		super();
	}

	public getInventoryDetailsController = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getInventoryDetailsValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getInventoryDetailsService(req);

			res.status(code).json(data);
		}
	);

	public getSingleInventoryDetailsController = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleInventoryDetailsService(req);

			res.status(code).json(data);
		}
	);
}
export default InventoryController;
