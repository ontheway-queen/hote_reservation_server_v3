import AbstractRouter from "../../abstarcts/abstract.router";
import CommonInvRouter from "./common.inv.router";
import ProductInvRouter from "./product.router";
import PurchaseInvRouter from "./purchase.router";
import StockInvRouter from "./stock.router";

class HotelInventoryRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // common
    this.router.use("/common", new CommonInvRouter().router);

    // product
    this.router.use("/product", new ProductInvRouter().router);

    // purchase
    this.router.use("/purchase", new PurchaseInvRouter().router);

    // stock
    this.router.use("/stock", new StockInvRouter().router);
  }
}
export default HotelInventoryRouter;
