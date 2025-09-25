import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantMeasurementService from "../services/measurement.service";
import RestaurantMeasurementsValidator from "../utils/validator/measurement.validator";

class RestaurantMeasurementController extends AbstractController {
	private validator = new RestaurantMeasurementsValidator();
	private service = new RestaurantMeasurementService();

	constructor() {
		super();
	}

	public createMeasurement = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createMeasurementsValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createMeasurement(req);
			res.status(code).json(data);
		}
	);

	public getMeasurements = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getMenuCategoriesValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getMeasurements(req);
			res.status(code).json(data);
		}
	);

	public updateMeasurement = this.asyncWrapper.wrap(
		{
			bodySchema: this.validator.updateMeasurementsValidator,
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateMeasurement(req);
			res.status(code).json(data);
		}
	);

	public deleteMeasurement = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteMeasurement(req);
			res.status(code).json(data);
		}
	);
}

export default RestaurantMeasurementController;
