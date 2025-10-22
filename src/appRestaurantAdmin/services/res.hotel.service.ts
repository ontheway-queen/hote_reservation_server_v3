import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class RestaurantHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async geAllBookings(req: Request) {
    const { hotel_code } = req.restaurant_admin;

    const { limit, skip, search } = req.query;

    const data = await this.restaurantModel
      .restaurantHotelModel()
      .getAllBooking({
        hotel_code,
        limit: limit as string,
        skip: skip as string,
        search: search as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      ...data,
    };
  }

  public async getBookingRoomsByBookingRef(req: Request) {
    const { hotel_code } = req.restaurant_admin;

    const data = await this.restaurantModel
      .restaurantHotelModel()
      .getBookingRoomsByBookingRef({
        hotel_code,
        booking_ref: req.params.ref,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async getAllAccount(req: Request) {
    const { hotel_code } = req.restaurant_admin;

    const { ac_type, key, limit, skip } = req.query;

    const { data, total } = await this.Model.accountModel().getAllAccounts({
      hotel_code,
      status: "true",
      ac_type: ac_type as string,
      key: key as string,
      limit: limit as string,
      skip: skip as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getAllFloors(req: Request) {
    const { hotel_code } = req.restaurant_admin;

    const { data } = await this.Model.settingModel().getAllFloors({
      hotel_code,
      status: "true",
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,

      data,
    };
  }

  public async getAssignFoodIngredientsToRestaurant(req: Request) {
    const { hotel_code } = req.restaurant_admin;

    const data = await this.restaurantModel
      .restaurantModel()
      .getAssignFoodIngredientsToRestaurant(hotel_code);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}

export default RestaurantHotelService;
