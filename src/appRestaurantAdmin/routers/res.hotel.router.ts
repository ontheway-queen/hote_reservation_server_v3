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

    this.router.route("/account").get(this.controller.getAllAccount);
  }
}

export default HotelRouter;
