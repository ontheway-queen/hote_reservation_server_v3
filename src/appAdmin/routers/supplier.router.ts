import AbstractRouter from "../../abstarcts/abstract.router";
import SupplierController from "../controllers/supplier.controller";

class SupplierRouter extends AbstractRouter {
  private controller = new SupplierController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(this.controller.createSupplier)
      .get(this.controller.getAllSupplier);

    this.router
      .route("/payment")
      .post(this.controller.supplierPayment)
      .get(this.controller.getAllSupplierPayment);

    this.router
      .route("/payment/by-sup-id/:id")
      .get(this.controller.getSingleSupplierPaymentById);

    this.router
      .route("/transaction")
      .get(this.controller.getAllSupplierTransaction);

    this.router
      .route("/transaction/by-sup/:id")
      .get(this.controller.getSingleSupplierTransaction);

    this.router
      .route("/invoice/by-sup-id/:id")
      .get(this.controller.getAllSupplierInvoiceById);

    // edit Supplier
    this.router
      .route("/:id")
      .patch(this.controller.updateSupplier)
      .delete(this.controller.deleteSupplier);
  }
}
export default SupplierRouter;
