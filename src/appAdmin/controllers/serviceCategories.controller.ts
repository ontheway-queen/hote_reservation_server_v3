import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ServiceCategoriesService from "../services/serviceCategories.service";
import ServiceCategoriesValidator from "../utlis/validator/serviceCategories.validator";

class ServiceCategoriesController extends AbstractController {
	private service = new ServiceCategoriesService();
	private validator = new ServiceCategoriesValidator();

	constructor() {
		super();
	}

	public createServiceCategory = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createServiceCategory },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createServiceCategory(
				req
			);
			res.status(code).json(data);
		}
	);

	public getAllServiceCategories = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getServiceCategoryQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getAllServiceCategories(req);
			res.status(code).json(data);
		}
	);

	public updateServiceCategory = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.updateServiceCategoryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateServiceCategory(
				req
			);
			res.status(code).json(data);
		}
	);

	public deleteServiceCategory = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteServiceCategory(
				req
			);
			res.status(code).json(data);
		}
	);
}
export default ServiceCategoriesController;
