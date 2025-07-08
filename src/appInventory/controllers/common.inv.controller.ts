import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import CommonInvService from "../services/common.inv.service";
import CommonInvValidator from "../utils/validation/common.inv.validator";

class CommonInvController extends AbstractController {
	private service = new CommonInvService();
	private validator = new CommonInvValidator();
	constructor() {
		super();
	}

	//=================== Category ======================//

	// Create Category
	public createCategory = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createCategory(req);

			res.status(code).json(data);
		}
	);

	// Get All Category
	public getAllCategory = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllCommonModuleQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllCategory(req);

			res.status(code).json(data);
		}
	);

	// Update Category
	public updateCategory = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.UpdateCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateCategory(req);

			res.status(code).json(data);
		}
	);

	//   Delete Category
	public deleteCategory = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.deleteCategory(req);
			res.status(code).json(data);
		}
	);
	//=================== Unit ======================//

	// Create Unit
	public createUnit = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createUnit(req);

			res.status(code).json(data);
		}
	);

	// Get All Unit
	public getAllUnit = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllCommonModuleQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllUnit(req);

			res.status(code).json(data);
		}
	);

	// Update Unit
	public updateUnit = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.UpdateCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateUnit(req);

			res.status(code).json(data);
		}
	);

	//=================== Brand ======================//

	// Create Brand
	public createBrand = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createBrand(req);

			res.status(code).json(data);
		}
	);

	// Get All Brand
	public getAllBrand = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllCommonModuleQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllBrand(req);

			res.status(code).json(data);
		}
	);

	// Update Brand
	public updateBrand = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.UpdateCommonModuleValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateBrand(req);

			res.status(code).json(data);
		}
	);

	//=================== Supplier Controller ======================//

	// create Supplier
	public createSupplier = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createSupplierValidatorValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createSupplier(req);

			res.status(code).json(data);
		}
	);

	// get All Supplier
	public getAllSupplier = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getAllSupplierQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllSupplier(req);

			res.status(code).json(data);
		}
	);

	// get All Supplier payment
	public getAllSupplierPayment = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllSupplierPayment(
				req
			);

			res.status(code).json(data);
		}
	);

	// update Supplier
	public updateSupplier = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.UpdateSupplierValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateSupplier(req);

			res.status(code).json(data);
		}
	);

	// Supplier payment report
	public getSupplierLedgerReport = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSupplierLedgerReport(req);

			res.status(code).json(data);
		}
	);
}
export default CommonInvController;
