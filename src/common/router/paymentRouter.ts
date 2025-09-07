import AbstractRouter from "../../abstarcts/abstract.router";
import PaymentController from "../controllers/paymentController";

class PaymentRouter extends AbstractRouter {
  private Controller = new PaymentController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use(
      "/btoc/srj/success",
      this.Controller.btocSurjoPaymentSuccess
    );

    this.router.use(
      "/btoc/srj/cancelled",
      this.Controller.btocSurjoPaymentCancelled
    );

    this.router.use("/btoc/srj/failed", this.Controller.btocSurjoPaymentFailed);
  }
}

export default PaymentRouter;
