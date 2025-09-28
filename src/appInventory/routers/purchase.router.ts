import AbstractRouter from "../../abstarcts/abstract.router";
import PurchaseInvController from "../controllers/purchase.controller";

class PurchaseInvRouter extends AbstractRouter {
  private controller = new PurchaseInvController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // purchase
    this.router
      .route("/")
      .post(this.controller.createPurchase)
      .get(this.controller.getAllPurchase);

    // get money receipt by purchase id
    this.router
      .route("/receipt-by/purchase/:id")
      .get(this.controller.getMoneyReceiptByPurchaseId);

    this.router
      .route("/invoice-by/purchase/:id")
      .get(this.controller.getInvoiceByPurchaseId);

    // single purchase
    this.router.route("/:id").get(this.controller.getSinglePurchase);
  }
}
export default PurchaseInvRouter;
