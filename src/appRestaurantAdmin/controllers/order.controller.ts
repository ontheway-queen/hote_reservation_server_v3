import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import RestaurantOrderService from "../services/order.service";
import RestaurantOrderValidator from "../utils/validator/order.validator";

class RestaurantOrderController extends AbstractController {
	private validator = new RestaurantOrderValidator();
	private service = new RestaurantOrderService();

	constructor() {
		super();
	}

	public createOrder = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.createOrderValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.createOrder(req);
			res.status(code).json(data);
		}
	);

	public getOrders = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getOrders(req);
			res.status(code).json(data);
		}
	);

	public getOrderById = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getOrderById(req);
			res.status(code).json(data);
		}
	);

	public getOrdersByTableId = this.asyncWrapper.wrap(
		{
			paramSchema:
				this.commonValidator.singleParamStringValidator("table_id"),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getOrdersByTableId(
				req
			);
			res.status(code).json(data);
		}
	);

	public cancelOrder = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.cancelOrder(req);
			res.status(code).json(data);
		}
	);

	public completeOrderPayment = this.asyncWrapper.wrap(
		{
			bodySchema: this.validator.completeOrderPaymentValidator,
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.completeOrderPayment(
				req
			);
			res.status(code).json(data);
		}
	);

	public getKitchenOrders = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getKitchenOrders(req);
			res.status(code).json(data);
		}
	);

	public updateKitchenOrders = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamStringValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateKitchenOrders(
				req
			);
			res.status(code).json(data);
		}
	);

	public updateOrder = this.asyncWrapper.wrap(
		{
			bodySchema: this.validator.updateOrderValidator,
			paramSchema: this.commonValidator.singleParamStringValidator(),
		},
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.updateOrder(req);
			res.status(code).json(data);
		}
	);

	// public deleteTable = this.asyncWrapper.wrap(
	// 	{
	// 		paramSchema: this.commonValidator.singleParamStringValidator(),
	// 	},
	// 	async (req: Request, res: Response) => {
	// 		const { code, ...data } = await this.service.deleteTable(req);
	// 		res.status(code).json(data);
	// 	}
	// );
}

export default RestaurantOrderController;
