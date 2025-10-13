"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantModels = void 0;
const restaurant_admin_model_1 = __importDefault(require("./restaurantModels/restaurant.admin.model"));
const restaurant_category_model_1 = __importDefault(require("./restaurantModels/restaurant.category.model"));
const restaurant_food_table_1 = __importDefault(require("./restaurantModels/restaurant.food.table"));
const restaurant_Model_1 = __importDefault(require("./restaurantModels/restaurant.Model"));
const restaurant_order_model_1 = __importDefault(require("./restaurantModels/restaurant.order.model"));
const restaurant_report_model_1 = __importDefault(require("./restaurantModels/restaurant.report.model"));
const restaurant_table_model_1 = __importDefault(require("./restaurantModels/restaurant.table.model"));
const restaurant_unit_model_1 = __importDefault(require("./restaurantModels/restaurant.unit.model"));
const restaurant_hotel_model_1 = __importDefault(require("./restaurantModels/restaurant.hotel.model"));
class RestaurantModels {
    constructor(db) {
        this.db = db;
    }
    restaurantModel(trx) {
        return new restaurant_Model_1.default(trx || this.db);
    }
    restaurantHotelModel(trx) {
        return new restaurant_hotel_model_1.default(trx || this.db);
    }
    restaurantAdminModel(trx) {
        return new restaurant_admin_model_1.default(trx || this.db);
    }
    restaurantTableModel(trx) {
        return new restaurant_table_model_1.default(trx || this.db);
    }
    restaurantCategoryModel(trx) {
        return new restaurant_category_model_1.default(trx || this.db);
    }
    restaurantUnitModel(trx) {
        return new restaurant_unit_model_1.default(trx || this.db);
    }
    restaurantFoodModel(trx) {
        return new restaurant_food_table_1.default(trx || this.db);
    }
    restaurantOrderModel(trx) {
        return new restaurant_order_model_1.default(trx || this.db);
    }
    restaurantReportModel(trx) {
        return new restaurant_report_model_1.default(trx || this.db);
    }
}
exports.RestaurantModels = RestaurantModels;
//# sourceMappingURL=restaurantRootModel.js.map