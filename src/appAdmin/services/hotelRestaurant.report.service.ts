import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class HotelRestaurantReportService extends AbstractServices {
  constructor() {
    super();
  }

  public async getSalesReport(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { from_date, to_date, order_type, limit, skip, restaurant_id } =
      req.query;

    const { data, total, totals } = await this.restaurantModel
      .restaurantReportModel()
      .getSalesReport({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        restaurant_id: Number(restaurant_id as string),
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

  public async getOrderInfo(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const data = await model.getOrderInfo({
      hotel_code,
      restaurant_id: Number(req.query.restaurant_id as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getDailyOrderCounts(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const model = this.restaurantModel.restaurantReportModel();

    const { from_date, to_date, order_type, restaurant_id } = req.query;

    const data = await model.getDailyOrderCounts({
      hotel_code,
      restaurant_id: Number(restaurant_id as string),
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
    const { hotel_code } = req.hotel_admin;
    const { restaurant_id, from_date, to_date } = req.query;

    const data = await this.restaurantModel
      .restaurantReportModel()
      .getProductsReport({
        hotel_code,
        restaurant_id: Number(restaurant_id as string),
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
    const { hotel_code } = req.hotel_admin;

    const { from_date, to_date, restaurant_id } = req.query;

    const data = await this.restaurantModel
      .restaurantReportModel()
      .getSalesChart({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        restaurant_id: Number(restaurant_id),
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getUserSalesReport(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const { from_date, to_date, user_id, limit, skip, restaurant_id } =
      req.query;

    const { data, total, totals } = await this.restaurantModel
      .restaurantReportModel()
      .getUserSalesReport({
        from_date: from_date as string,
        to_date: to_date as string,
        user_id: user_id as string,
        hotel_code,
        restaurant_id: Number(restaurant_id),
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

export default HotelRestaurantReportService;
