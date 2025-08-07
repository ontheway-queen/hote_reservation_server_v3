import AbstractRouter from "../../abstarcts/abstract.router";
import MHotelController from "../controllers/mHotel.controller";

class MHotelRouter extends AbstractRouter {
  public hotelController;

  constructor() {
    super();
    this.hotelController = new MHotelController();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_FILES),
        this.hotelController.createHotel
      )
      .get(this.hotelController.getAllHotel);

    this.router
      .route("/:id")
      .get(this.hotelController.getSingleHotel)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTEL_FILES),
        this.hotelController.updateHotel
      );

    this.router
      .route("/direct-login/:id")
      .post(this.hotelController.directLogin);

    this.router
      .route("/acc-heads/by-hc/:h_code")
      .get(this.hotelController.getAllAccHeads)
      .post(this.hotelController.insertAccHead);

    this.router
      .route("/acc-heads/renew/by-hc/:h_code")
      .post(this.hotelController.renewAccHead);
  }
}

export default MHotelRouter;
