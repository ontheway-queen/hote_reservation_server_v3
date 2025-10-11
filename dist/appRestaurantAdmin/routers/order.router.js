"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
class RestaurantOrderRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new order_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router.route("/kitchen-orders").get(this.controller.getKitchenOrders);
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
        this.router.route("/cancel-order/:id").delete(this.controller.cancelOrder);
    }
}
exports.default = RestaurantOrderRouter;
//# sourceMappingURL=order.router.js.map