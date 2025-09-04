import AbstractRouter from "../../abstarcts/abstract.router";
import { BtocPaymentController } from "../controllers/btoc.payment.controller";

export class BtocPaymentRouter extends AbstractRouter {
  private controller = new BtocPaymentController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // this.router.route("/").post(this.controller.createPayment);

    // this.router
    //   .route("/transaction/:id")
    //   .get(
    //     this.controller.getAllMoneyReceiptByinvoiceID);

    this.router
      .route("/surjopay-order")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.BTOC_BOOKING_FILES),
        this.controller.createSurjopayPaymentOrder
      );

    // this.router.route("/invoice").get(this.controller.getInvoice);

    // this.router.route("/invoice/:id").get(this.controller.singleInvoice);
  }
}
