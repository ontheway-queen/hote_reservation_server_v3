import AbstractRouter from "../../abstarcts/abstract.router";
import InvoiceController from "../controllers/invoice.controller";

class InvoiceRouter extends AbstractRouter {
  private invoiceController;
  constructor() {
    super();
    this.invoiceController = new InvoiceController();
    this.callRouter();
  }

  private callRouter() {
    // get all invoice router
    this.router
      .route("/")
      .get(this.invoiceController.getAllInvoice)
      .post(this.invoiceController.createInvoice);

    // get all invoice router
    this.router
      .route("/for/money-receipt")
      .get(this.invoiceController.getAllInvoiceForMoneyReceipt);

    // get single invoice router
    this.router
      .route("/:invoice_id")
      .get(this.invoiceController.getSingleInvoice);
  }
}
export default InvoiceRouter;
