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
    this.router
      .route("/folio-invoice")
      .post(this.invoiceController.createFolioInvoice);
  }
}
export default InvoiceRouter;
