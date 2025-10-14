import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantReportController from "../controllers/report.controller";

class RestaurantReportRouter extends AbstractRouter {
  private controller = new RestaurantReportController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router.route("/order-info").get(this.controller.getOrderInfo);

    this.router
      .route("/daily-order-counts")
      .get(this.controller.getDailyOrderCounts);

    this.router
      .route("/hourly-order-counts")
      .get(this.controller.getHourlyOrders);

    this.router
      .route("/get-selling-items")
      .get(this.controller.getSellingItems);

    this.router.route("/sells-report").get(this.controller.getSellsReport);

    this.router
      .route("/products-report")
      .get(this.controller.getProductsReport);

    this.router
      .route("/user-sells-report")
      .get(this.controller.getUserSellsReport);
  }
}

export default RestaurantReportRouter;
