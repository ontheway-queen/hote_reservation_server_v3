import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ConfigurationService from "../services/configuration.service";

class ConfigurationController extends AbstractController {
	private service = new ConfigurationService();

	constructor() {
		super();
	}

	// ======================= Shift ======================= //
	public createShift = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createShift(req);
			res.status(code).json(data);
		}
	);

	public getAllShifts = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllShifts(req);
			res.status(code).json(data);
		}
	);

	public getSingleShift = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleShift(req);
			res.status(code).json(data);
		}
	);

	public updateShift = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateShift(req);
			res.status(code).json(data);
		}
	);

	public deleteShift = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteShift(req);
			res.status(code).json(data);
		}
	);

	// ======================= Allowances ======================= //
	public createAllowances = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createAllowances(req);
			res.status(code).json(data);
		}
	);

	public getAllAllowances = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllAllowances(req);
			res.status(code).json(data);
		}
	);

	public getSingleAllowance = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleAllowance(
				req
			);
			res.status(code).json(data);
		}
	);

	public updateAllowance = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateAllowance(req);
			res.status(code).json(data);
		}
	);

	public deleteAllowance = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteAllowance(req);
			res.status(code).json(data);
		}
	);

	// ======================= Deductions ======================= //
	public createDeductions = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createDeductions(req);
			res.status(code).json(data);
		}
	);

	public getAllDeductions = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllDeductions(req);
			res.status(code).json(data);
		}
	);

	public getSingleDeduction = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleDeduction(
				req
			);
			res.status(code).json(data);
		}
	);

	public updateDeduction = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateDeduction(req);
			res.status(code).json(data);
		}
	);

	public deleteDeduction = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator("id") },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteDeduction(req);
			res.status(code).json(data);
		}
	);
}

export default ConfigurationController;
