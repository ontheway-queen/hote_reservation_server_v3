import { Router } from "express";
import AuthChecker from "../common/middleware/authChecker/authChecker";
import RestaurantFoodRouter from "./routers/food.router";
import RestaurantMenuCategoryRouter from "./routers/menuCategory.router";
import RestaurantOrderRouter from "./routers/order.router";
import RestaurantReportRouter from "./routers/report.router";
import HotelRouter from "./routers/res.hotel.router";
import RestaurantTableRouter from "./routers/restaurantTable.router";
import RestaurantStaffRouter from "./routers/staff.routers";
import RestaurantUnitRouter from "./routers/unit.router";
import ResAdministrationRouter from "./routers/res.administration.router";

export class RestaurantRootRouter {
  public router = Router();
  public authChecker = new AuthChecker();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.router.use(
      "/administration",
      this.authChecker.hotelRestaurantAuthChecker,
      new ResAdministrationRouter().router
    );

    this.router.use(
      "/table",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantTableRouter().router
    );

    this.router.use(
      "/menu-category",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantMenuCategoryRouter().router
    );

    this.router.use(
      "/hotel",
      this.authChecker.hotelRestaurantAuthChecker,
      new HotelRouter().router
    );

    this.router.use(
      "/unit",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantUnitRouter().router
    );

    this.router.use(
      "/food",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantFoodRouter().router
    );

    this.router.use(
      "/order",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantOrderRouter().router
    );

    this.router.use(
      "/report",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantReportRouter().router
    );

    this.router.use(
      "/staff",
      this.authChecker.hotelRestaurantAuthChecker,
      new RestaurantStaffRouter().router
    );
  }
}
