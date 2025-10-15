import AbstractRouter from "../../abstarcts/abstract.router";
import RestaurantHotelController from "../controllers/res.hotel.controller";

class HotelRouter extends AbstractRouter {
  private controller = new RestaurantHotelController();

  constructor() {
    super();
    this.callV1Router();
  }

  private callV1Router() {
    this.router.route("/bookings").get(this.controller.geAllBookings);
    this.router
      .route("/booking-rooms/by-booking-ref/:ref")
      .get(this.controller.getBookingRoomsByBookingRef);

    this.router.route("/account").get(this.controller.getAllAccount);

    this.router.route("/floors").get(this.controller.getAllFloors);
  }
}

export default HotelRouter;
