import { Knex } from "knex";
import HotelRestaurantAdminModel from "./restaurantModels/restaurant.admin.model";
import RestaurantCategoryModel from "./restaurantModels/restaurant.category.model";
import RestaurantFoodModel from "./restaurantModels/restaurant.food.table";
import RestaurantModel from "./restaurantModels/restaurant.Model";
import RestaurantOrderModel from "./restaurantModels/restaurant.order.model";
import RestaurantReportModel from "./restaurantModels/restaurant.report.model";
import RestaurantTableModel from "./restaurantModels/restaurant.table.model";
import RestaurantUnitModel from "./restaurantModels/restaurant.unit.model";
import RestaurantHotelModel from "./restaurantModels/restaurant.hotel.model";

export class RestaurantModels {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  public restaurantModel(trx?: Knex.Transaction) {
    return new RestaurantModel(trx || this.db);
  }

  public restaurantHotelModel(trx?: Knex.Transaction) {
    return new RestaurantHotelModel(trx || this.db);
  }

  public restaurantAdminModel(trx?: Knex.Transaction) {
    return new HotelRestaurantAdminModel(trx || this.db);
  }

  public restaurantTableModel(trx?: Knex.Transaction) {
    return new RestaurantTableModel(trx || this.db);
  }

  public restaurantCategoryModel(trx?: Knex.Transaction) {
    return new RestaurantCategoryModel(trx || this.db);
  }

  public restaurantUnitModel(trx?: Knex.Transaction) {
    return new RestaurantUnitModel(trx || this.db);
  }

  public restaurantFoodModel(trx?: Knex.Transaction) {
    return new RestaurantFoodModel(trx || this.db);
  }

  public restaurantOrderModel(trx?: Knex.Transaction) {
    return new RestaurantOrderModel(trx || this.db);
  }

  public restaurantReportModel(trx?: Knex.Transaction) {
    return new RestaurantReportModel(trx || this.db);
  }
}
