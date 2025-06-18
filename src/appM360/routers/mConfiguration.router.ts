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

    this.router.route("/country").get(this.controller.getAllCountry);

    this.router
      .route("/permission")
      .get(this.controller.getAllPermission)
      .post(this.controller.createPermission);

    //------------------------------ Room type amenities ------------------------------//

    //create and get room amenities amenities head
    this.router
      .route("/room-type-amenities-head")
      .post(this.controller.createRoomTypeAmenitiesHead)
      .get(this.controller.getAllRoomTypeAmenitiesHead);

    // update and delete room type amenities
    this.router
      .route("/room-type-amenities-head/:id")
      .patch(this.controller.updateRoomTypeAmenitiesHead);

    // room type amenities
    this.router
      .route("/room-type-amenities")
      .post(
        this.uploader.cloudUploadRaw("room-type-amenities-icons"),
        this.controller.createRoomTypeAmenities
      )
      .get(this.controller.getAllRoomTypeAmenities);

    // update and delete room type amenities
    this.router
      .route("/room-type-amenities/:id")
      .patch(
        this.uploader.cloudUploadRaw("room-type-amenities-icons"),
        this.controller.updateRoomTypeAmenities
      )
      .delete(this.controller.deleteRoomTypeAmenities);
  }
}

export default MConfigurationRouter;
