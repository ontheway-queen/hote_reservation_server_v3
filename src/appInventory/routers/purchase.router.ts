import AbstractRouter from "../../abstarcts/abstract.router";
import PurchaseInvController from "../controllers/purchase.controller";

class PurchaseInvRouter extends AbstractRouter {
  private controller = new PurchaseInvController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //=================== Purchase ======================//

    // purchase
    this.router
      .route("/")
      .post(this.controller.createPurchase)
      .get(this.controller.getAllPurchase);

    // create purchase money reciept
    this.router
      .route("/money-reciept")
      .post(this.controller.createPurchaseMoneyReciept);

    // single purchase
    this.router.route("/:id").get(this.controller.getSinglePurchase);
  }
}
export default PurchaseInvRouter;
