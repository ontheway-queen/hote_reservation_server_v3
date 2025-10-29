import AbstractRouter from "../../abstarcts/abstract.router";
import HotelRestaurantReportController from "../controllers/hotelRestaurant.report.controller";

class HotelRestaurantReportRouter extends AbstractRouter {
  private controller = new HotelRestaurantReportController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/sales-report").get(this.controller.getSalesReport);

    this.router.route("/order-info").get(this.controller.getOrderInfo);

    this.router
      .route("/daily-order-counts")
      .get(this.controller.getDailyOrderCounts);

    this.router
      .route("/products-category-report")
      .get(this.controller.getProductCategoryWiseReport);

    this.router.route("/sales-chart").get(this.controller.getSalesChart);

    this.router
      .route("/products-report")
      .get(this.controller.getProductsReport);

    this.router
      .route("/user-sales-report")
      .get(this.controller.getUserSalesReport);
  }
}

export default HotelRestaurantReportRouter;
