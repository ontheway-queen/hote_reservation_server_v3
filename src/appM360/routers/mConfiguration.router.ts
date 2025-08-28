import AbstractRouter from "../../abstarcts/abstract.router";
import MConfigurationController from "../controllers/mConfiguration.controller";

class MConfigurationRouter extends AbstractRouter {
  public controller;

  constructor() {
    super();
    this.controller = new MConfigurationController();
    this.callRouter();
  }
  private callRouter() {
    this.router.route("/accommodation").get(this.controller.getAllAccomodation);

    this.router
      .route("/accommodation/:id")
      .get(this.controller.getAllAccomodation);

    this.router
      .route("/city")
      .get(this.controller.getAllCity)
      .post(this.controller.insertCity);

    // ---------------------- for reservation -------------------//
    this.router
      .route("/permission-group")
      .post(this.controller.createPermissionGroup)
      .get(this.controller.getPermissionGroup);

    this.router
      .route("/permission/by-hotel-code/:hotel_code")
      .get(this.controller.getSingleHotelPermission)
      .patch(this.controller.updateSingleHotelPermission);

    this.router
      .route("/permission")
      .post(this.controller.createPermission)
      .get(this.controller.getAllPermission);

    //-------------------------

    this.router.route("/country").get(this.controller.getAllCountry);

    //------------------------------ Room type amenities ------------------------------//

    //create and get room amenities amenities head
    this.router
      .route("/room-type-amenities-head")
      .post(this.controller.createAmenitiesHead)
      .get(this.controller.getAllAmenitiesHead);

    // update and delete room type amenities
    this.router
      .route("/room-type-amenities-head/:id")
      .patch(this.controller.updateAmenitiesHead);

    // room type amenities
    this.router
      .route("/room-type-amenities")
      .post(
        this.uploader.cloudUploadRaw("room-type-amenities-icons"),
        this.controller.createAmenities
      )
      .get(this.controller.getAllAmenities);

    // update and delete room type amenities
    this.router
      .route("/room-type-amenities/:id")
      .patch(
        this.uploader.cloudUploadRaw("room-type-amenities-icons"),
        this.controller.updateAmenities
      )
      .delete(this.controller.deleteAmenities);
  }
}

export default MConfigurationRouter;
