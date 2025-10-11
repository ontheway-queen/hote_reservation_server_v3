import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantMenuCategoryService from "../services/menuCategory.service";
import RestaurantMenuCategoryValidator from "../utils/validator/menuCategory.validator";

class RestaurantMenuCategoryController extends AbstractController {
	private validator = new RestaurantMenuCategoryValidator();
	private service = new RestaurantMenuCategoryService();

	constructor() {
		super();
	}

	public createMenuCategory = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createMenuCategoryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createMenuCategory(
				req
			);
			res.status(code).json(data);
		}
	);

	public getMenuCategories = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getMenuCategoriesValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getMenuCategories(req);
			res.status(code).json(data);
		}
	);

	public updateMenuCategory = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateMenuCategory(
				req
			);
			res.status(code).json(data);
		}
	);

	public deleteMenuCategory = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteMenuCategory(
				req
			);
			res.status(code).json(data);
		}
	);
}

export default RestaurantMenuCategoryController;
