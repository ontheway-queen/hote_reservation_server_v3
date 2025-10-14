import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
  IUnitRequest,
  IUpdateUnitRequest,
} from "../utils/interface/unit.interface";

class RestaurantUnitService extends AbstractServices {
  constructor() {
    super();
  }

  public async createUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, restaurant_id, hotel_code } = req.restaurant_admin;
      const body = req.body as IUnitRequest;

      const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);

      await restaurantUnitModel.createUnit({
        ...body,
        hotel_code,
        restaurant_id,
        created_by: id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Unit created successfully.",
      };
    });
  }

  public async getUnits(req: Request) {
    const { restaurant_id, hotel_code } = req.restaurant_admin;

    const { limit, skip, name } = req.query;

    const data = await this.restaurantModel.restaurantUnitModel().getUnits({
      hotel_code,
      restaurant_id,
      limit: Number(limit),
      skip: Number(skip),
      name: name as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      ...data,
    };
  }

  public async updateUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { restaurant_id, hotel_code } = req.restaurant_admin;
      const body = req.body as IUpdateUnitRequest;

      const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);

      const isUnitExists = await restaurantUnitModel.getUnits({
        hotel_code,
        restaurant_id,
        id: parseInt(id),
      });

      if (isUnitExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Unit not found.",
        };
      }

      await restaurantUnitModel.updateUnit({
        id: parseInt(id),
        payload: body,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Unit updated successfully.",
      };
    });
  }

  public async deleteUnit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { restaurant_id, hotel_code } = req.restaurant_admin;

      const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);

      const isUnitExists = await restaurantUnitModel.getUnits({
        hotel_code,
        restaurant_id,
        id: parseInt(id),
      });

      if (isUnitExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Unit not found.",
        };
      }

      await restaurantUnitModel.deleteUnit({
        id: parseInt(id),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Unit deleted successfully.",
      };
    });
  }
}

export default RestaurantUnitService;
