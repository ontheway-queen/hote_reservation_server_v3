"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
class PaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new paymentController_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/btoc/srj/success", this.Controller.btocSurjoPaymentSuccess);
        this.router.use("/btoc/srj/cancelled", this.Controller.btocSurjoPaymentCancelled);
        this.router.use("/btoc/srj/failed", this.Controller.btocSurjoPaymentFailed);
    }
}
exports.default = PaymentRouter;
//# sourceMappingURL=paymentRouter.js.map