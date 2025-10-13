import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import { IFoodRequest } from "../utils/interface/food.interface";
import Lib from "../../utils/lib/lib";
import { ASSET_GROUP } from "../../utils/miscellaneous/constants";

class RestaurantFoodService extends AbstractServices {
  constructor() {
    super();
  }

  public async createFood(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, restaurant_id, hotel_code } = req.restaurant_admin;

      const food = (req.body as any).food as IFoodRequest;

      const files = (req.files as Express.Multer.File[]) || [];
      if (Array.isArray(files)) {
        for (const file of files) {
          food.photo = file.filename;
        }
      }

      const restaurantMenuCategoryModel =
        this.restaurantModel.restaurantCategoryModel(trx);
      const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);
      const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);

      const isMenuCategoryExists =
        await restaurantMenuCategoryModel.getMenuCategories({
          hotel_code,
          restaurant_id,
          id: food.menu_category_id,
        });

      if (isMenuCategoryExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Menu Category not found.",
        };
      }

      const isUnitExists = await restaurantUnitModel.getUnits({
        hotel_code,
        restaurant_id,
        id: food.unit_id,
      });

      if (isUnitExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Unit not found.",
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Food created successfully.",
      };
    });
  }

  public async getFoods(req: Request) {
    const { restaurant_id, hotel_code } = req.restaurant_admin;

    const { limit, skip, name, category_id } = req.query;

    const data = await this.restaurantModel.restaurantFoodModel().getFoods({
      hotel_code,
      restaurant_id,
      limit: Number(limit),
      skip: Number(skip),
      name: name as string,
      menu_category_id: Number(category_id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }

  public async updateFood(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { restaurant_id, hotel_code } = req.restaurant_admin;
      const body = (req.body as any).food as Partial<IFoodRequest>;

      const files = (req.files as Express.Multer.File[]) || [];
      if (Array.isArray(files)) {
        for (const file of files) {
          body.photo = file.filename;
        }
      }

      const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
      const restaurantCategoryModel =
        this.restaurantModel.restaurantCategoryModel(trx);
      const restaurantUnitModel = this.restaurantModel.restaurantUnitModel(trx);

      const isFoodExists = await restaurantFoodModel.getFoods({
        id: parseInt(id),
        hotel_code,
        restaurant_id,
      });

      if (isFoodExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Food not found.",
        };
      }

      if (body.menu_category_id) {
        const isMenuCategoryExists =
          await restaurantCategoryModel.getMenuCategories({
            hotel_code,
            restaurant_id,
            id: body.menu_category_id,
          });

        if (isMenuCategoryExists.data.length === 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Menu Category not found.",
          };
        }
      }

      if (body.unit_id) {
        const isUnitExists = await restaurantUnitModel.getUnits({
          hotel_code,
          restaurant_id,
          id: body.unit_id,
        });

        if (isUnitExists.data.length === 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Unit not found.",
          };
        }
      }

      await restaurantFoodModel.updateFood({
        where: { id: parseInt(id) },
        payload: body,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Food updated successfully.",
      };
    });
  }

  public async deleteFood(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { restaurant_id, hotel_code } = req.restaurant_admin;

      const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);

      const isFoodExists = await restaurantFoodModel.getFoods({
        id: parseInt(id),
        hotel_code,
        restaurant_id,
      });

      if (isFoodExists.data.length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Food not found.",
        };
      }

      await restaurantFoodModel.deleteFood({
        id: Number(id),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Food deleted successfully.",
      };
    });
  }
}

export default RestaurantFoodService;
