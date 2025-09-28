import AbstractRouter from "../../abstarcts/abstract.router";
import CommonInvController from "../controllers/common.inv.controller";

class CommonInvRouter extends AbstractRouter {
  private controller = new CommonInvController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //=================== Category ======================//

    // Category
    this.router
      .route("/category")
      .post(this.controller.createCategory)
      .get(this.controller.getAllCategory);

    // edit Category
    this.router
      .route("/category/:id")
      .patch(this.controller.updateCategory)
      .delete(this.controller.deleteCategory);

    //=================== Unit ======================//

    // Unit
    this.router
      .route("/unit")
      .post(this.controller.createUnit)
      .get(this.controller.getAllUnit);

    // edit Category
    this.router
      .route("/unit/:id")
      .patch(this.controller.updateUnit)
      .delete(this.controller.deleteUnit);

    //=================== Brand ======================//

    // Brand
    this.router
      .route("/brand")
      .post(this.controller.createBrand)
      .get(this.controller.getAllBrand);

    // edit Brand
    this.router
      .route("/brand/:id")
      .patch(this.controller.updateBrand)
      .delete(this.controller.deleteBrand);

    //=================== Supplier Router ======================//

    // Supplier
    this.router
      .route("/supplier")
      .post(this.controller.createSupplier)
      .get(this.controller.getAllSupplier);

    // Supplier
    this.router
      .route("/supplier/payment/by-sup-id/:id")
      .get(this.controller.getAllSupplierPaymentById);

    this.router
      .route("/supplier/invoice/by-sup-id/:id")
      .get(this.controller.getAllSupplierInvoiceById);

    // Supplier ledger report
    this.router.route("/supplier-ledger-report/by-sup-id/:id").get();

    // edit Supplier
    this.router
      .route("/supplier/:id")
      .patch(this.controller.updateSupplier)
      .delete(this.controller.deleteSupplier);
  }
}
export default CommonInvRouter;
