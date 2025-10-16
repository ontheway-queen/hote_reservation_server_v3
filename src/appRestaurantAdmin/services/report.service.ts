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
      code: this.StatusCode.HTTP_OK,
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
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }

  public async getProductsReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;

    const data = await this.restaurantModel
      .restaurantReportModel()
      .getProductsReport({
        hotel_code,
        restaurant_id,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getSalesChart(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;

    const { from_date, to_date } = req.query;

    const data = await this.restaurantModel
      .restaurantReportModel()
      .getSalesChart({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        restaurant_id,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
  public async getSalesReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;

    const { from_date, to_date, order_type, limit, skip } = req.query;

    const { data, total, totals } = await this.restaurantModel
      .restaurantReportModel()
      .getSalesReport({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        restaurant_id,
        order_type: order_type as string,
        limit: limit as string,
        skip: skip as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      totals,
      data,
    };
  }

  public async getUserSalesReport(req: Request) {
    const { hotel_code, restaurant_id } = req.restaurant_admin;

    const { from_date, to_date, user_id, limit, skip } = req.query;

    const { data, total, totals } = await this.restaurantModel
      .restaurantReportModel()
      .getUserSalesReport({
        from_date: from_date as string,
        to_date: to_date as string,
        user_id: user_id as string,
        hotel_code,
        restaurant_id,
        limit: limit as string,
        skip: skip as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      totals,
      data,
    };
  }
}

export default RestaurantReportService;
