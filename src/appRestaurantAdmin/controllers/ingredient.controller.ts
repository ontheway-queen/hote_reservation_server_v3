import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantIngredientService from "../services/ingredient.service";
import RestaurantIngredientValidator from "../utils/validator/ingredient.validator";

class RestaurantIngredientController extends AbstractController {
	private validator = new RestaurantIngredientValidator();
	private service = new RestaurantIngredientService();

	constructor() {
		super();
	}

	public createMeasurement = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createIngredientValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createMeasurement(req);
			res.status(code).json(data);
		}
	);

	public getIngredients = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getIngredientsValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getIngredients(req);
			res.status(code).json(data);
		}
	);

	public updateIngredient = this.asyncWrapper.wrap(
		{
			bodySchema: this.validator.updateIngredientValidator,
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateIngredient(req);
			res.status(code).json(data);
		}
	);

	public deleteIngredient = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteIngredient(req);
			res.status(code).json(data);
		}
	);
}

export default RestaurantIngredientController;
