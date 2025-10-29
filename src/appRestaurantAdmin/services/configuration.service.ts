import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IUnitRequest,
  IUpdateUnitRequest,
} from "../utils/interface/unit.interface";

class RestaurantConfigurationService extends AbstractServices {
  constructor() {
    super();
  }

  public async updatePrepareFoodOption(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, restaurant_id, hotel_code } = req.restaurant_admin;

      const restaurantUnitModel = this.restaurantModel.restaurantModel(trx);

      await restaurantUnitModel.updateRestaurant({
        id: restaurant_id,
        payload: {
          is_prepare_food_enabled: req.body.is_prepare_food_enabled,
        },
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Prepare food option updated",
      };
    });
  }
}

export default RestaurantConfigurationService;
