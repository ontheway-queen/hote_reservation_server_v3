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

    this.router.route("/sales-chart").get(this.controller.getSalesChart);

    this.router.route("/sales-report").get(this.controller.getSalesReport);

    this.router
      .route("/products-report")
      .get(this.controller.getProductsReport);

    this.router
      .route("/products-category-report")
      .get(this.controller.getProductCategoryWiseReport);

    this.router
      .route("/user-sales-report")
      .get(this.controller.getUserSalesReport);
  }
}

export default RestaurantReportRouter;
