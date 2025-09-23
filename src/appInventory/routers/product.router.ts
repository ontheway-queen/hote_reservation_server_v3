import AbstractRouter from "../../abstarcts/abstract.router";
import ProductInvController from "../controllers/product.controller";

class ProductInvRouter extends AbstractRouter {
  private controller = new ProductInvController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //=================== Product ======================//

    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.INVENTORY_FILES),
        this.controller.createProduct
      )
      .get(this.controller.getAllProduct);

    this.router
      .route("/:id")
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.INVENTORY_FILES),
        this.controller.updateProduct
      );

    //=================== Damaged Purchase ======================//

    // Damaged
    this.router
      .route("/damaged")
      .post(this.controller.createDamagedProduct)
      .get(this.controller.getAllDamagedProduct);

    // single Damaged
    this.router
      .route("/damaged/:id")
      .get(this.controller.getSingleDamagedProduct);
  }
}
export default ProductInvRouter;
