import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ServiceService from "../services/service.service";
import ServiceValidator from "../utlis/validator/service.validator";

class ServiceController extends AbstractController {
	private service = new ServiceService();
	private validator = new ServiceValidator();

	constructor() {
		super();
	}

	public createService = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createServiceValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createService(req);
			res.status(code).json(data);
		}
	);

	public getAllServices = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllServices(req);
			res.status(code).json(data);
		}
	);

	public getSingleService = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleService(req);
			res.status(code).json(data);
		}
	);

	public deleteService = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteService(req);
			res.status(code).json(data);
		}
	);

	public updateService = this.asyncWrapper.wrap(
		{
			paramSchema: this.commonValidator.singleParamStringValidator(),
			bodySchema: this.validator.updateServiceValidator,
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateService(req);
			res.status(code).json(data);
		}
	);
}
export default ServiceController;
