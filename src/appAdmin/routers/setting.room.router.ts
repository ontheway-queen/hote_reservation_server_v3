import AbstractRouter from "../../abstarcts/abstract.router";
import RoomSettingController from "../controllers/setting.room.controller";

class RoomSettingRouter extends AbstractRouter {
  private roomSettingController = new RoomSettingController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // room type
    this.router
      .route("/room-type")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.ROOM_TYPE_FILES),
        this.roomSettingController.createRoomType
      )
      .get(this.roomSettingController.getAllRoomType);

    // edit and remove room type
    this.router
      .route("/room-type/:id")
      .get(this.roomSettingController.getSingleRoomType)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ROOM_TYPE_FILES),
        this.roomSettingController.updateRoomType
      )
      .delete(this.roomSettingController.deleteRoomType);

    // room type
    this.router
      .route("/room-type-amenities")
      .get(this.roomSettingController.getAllRoomTypeAmenities);

    //=================== Room Type Categories Router ======================//

    // room type
    this.router
      .route("/room-type-categories")
      .post(this.roomSettingController.createRoomTypeCategories)
      .get(this.roomSettingController.getAllRoomTypeCategories);

    // edit and remove room type
    this.router
      .route("/room-type-categories/:id")
      .patch(this.roomSettingController.updateRoomTypeCategories)
      .delete(this.roomSettingController.deleteRoomTypeCategories);

    //=================== Bed Type Router ======================//

    // bed type
    this.router
      .route("/bed-type")
      .post(this.roomSettingController.createBedType)
      .get(this.roomSettingController.getAllBedType);

    // edit and remove bed type
    this.router
      .route("/bed-type/:id")
      .patch(this.roomSettingController.updateBedType)
      .delete(this.roomSettingController.deleteBedType);

    // floor setup
    this.router
      .route("/floor")
      .post(this.roomSettingController.createFloorSetup)
      .get(this.roomSettingController.getAllFloorSetup);

    // edit and remove floor setup
    this.router
      .route("/floor/:id")
      .patch(this.roomSettingController.updateFloorSetup)
      .delete(this.roomSettingController.deleteFloorSetup);

    //==================== Building Setup Router ======================//

    this.router
      .route("/building")
      .post(this.roomSettingController.createBuildingSetup)
      .get(this.roomSettingController.getAllBuildingSetup);

    // edit and remove building setup
    this.router
      .route("/building/:id")
      .patch(this.roomSettingController.updateBuildingSetup)
      .delete(this.roomSettingController.deleteBuildingSetup);
  }
}
export default RoomSettingRouter;
