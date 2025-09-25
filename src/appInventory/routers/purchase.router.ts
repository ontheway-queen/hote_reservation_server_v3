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

    // create purchase money reciept
    this.router
      .route("/money-reciept")
      .post(this.controller.createPurchaseMoneyReciept);

    // get money receipt by inoice id
    this.router
      .route("/receipt-by/purchase/:id")
      .get(this.controller.getMoneyReceiptById);

    this.router
      .route("/invoice-by/purchase/:id")
      .get(this.controller.getInvoiceByPurchaseId);

    // single purchase
    this.router.route("/:id").get(this.controller.getSinglePurchase);
  }
}
export default PurchaseInvRouter;
