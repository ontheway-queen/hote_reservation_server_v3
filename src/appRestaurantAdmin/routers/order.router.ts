import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantOrderController from "../controllers/order.controller";

class RestaurantOrderRouter extends AbstractRouter {
	private controller = new RestaurantOrderController();

	constructor() {
		super();
		this.callV1Router();
	}

	private callV1Router() {
		this.router
			.route("/kitchen-orders")
			.get(this.controller.getKitchenOrders);

		this.router
			.route("/kitchen-order/update-status/:id")
			.patch(this.controller.updateKitchenOrders);

		this.router
			.route("/")
			.post(this.controller.createOrder)
			.get(this.controller.getOrders);

		this.router
			.route("/table-order/:table_id")
			.get(this.controller.getOrdersByTableId);

		this.router
			.route("/:id")
			.get(this.controller.getOrderById)
			.patch(this.controller.updateOrder);
		// 	.delete(this.controller.deleteTable);

		this.router
			.route("/complete-order/:id")
			.patch(this.controller.completeOrderPayment);

		this.router
			.route("/cancel-order/:id")
			.delete(this.controller.cancelOrder);
	}
}

export default RestaurantOrderRouter;
