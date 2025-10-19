import AbstractRouter from "../../abstarcts/abstract.router";
import HotelRestaurantController from "../controllers/restaurant.hotel.controller";
import HotelRestaurantReportRouter from "./hotelRestaurant.report.router";

class HotelRestaurantRouter extends AbstractRouter {
  private Controller = new HotelRestaurantController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_RESTAURANT_FILES),
        this.Controller.createRestaurant
      )
      .get(this.Controller.getAllRestaurant);

    this.router.route("/add-staff").post(this.Controller.addStaffs);
    this.router
      .route("/remove-staff/:staff_id/:restaurant_id")
      .delete(this.Controller.removeStaff);

    this.router.use("/report", new HotelRestaurantReportRouter().router);

    this.router
      .route("/:id")
      .get(this.Controller.getRestaurantWithAdmin)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_RESTAURANT_FILES),
        this.Controller.updateHotelRestaurantAndAdmin
      );
  }
}
export default HotelRestaurantRouter;
