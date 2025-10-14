import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class RestaurantReportService extends AbstractServices {
  constructor() {
    super();
  }

  public async getOrderInfo(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const data = await model.getOrderInfo({
      hotel_code,
      restaurant_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data,
    };
  }

  public async getDailyOrderCounts(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date } = req.query;

    const data = await model.getDailyOrderCounts({
      hotel_code,
      restaurant_id,
      to_date: to_date as string,
      from_date: from_date as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      ...data,
    };
  }

  public async getHourlyOrders(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date } = req.query;

    const data = await model.getHourlyOrders({
      hotel_code,
      restaurant_id,
      to_date: to_date as string,
      from_date: from_date as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      ...data,
    };
  }

  public async getSellingItems(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const data = await model.getSellingItems({
      hotel_code,
      restaurant_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      ...data,
    };
  }

  public async getSellsReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date } = req.query;

    const data = await model.getSellsReport({
      from_date: from_date as string,
      to_date: to_date as string,
      hotel_code,
      restaurant_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data,
    };
  }

  public async getProductsReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date, name, category } = req.query;

    const data = await model.getProductsReport({
      from_date: from_date as string,
      to_date: to_date as string,
      name: name as string,
      category: category as string,
      hotel_code,
      restaurant_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data,
    };
  }

  public async getUserSellsReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date, user_id } = req.query;

    const data = await model.getUserSellsReport({
      from_date: from_date as string,
      to_date: to_date as string,
      user_id: Number(user_id),
      hotel_code,
      restaurant_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data,
    };
  }
}

export default RestaurantReportService;
