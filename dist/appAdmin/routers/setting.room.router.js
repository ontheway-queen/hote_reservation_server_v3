"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const setting_room_controller_1 = __importDefault(require("../controllers/setting.room.controller"));
class RoomSettingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.roomSettingController = new setting_room_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // room type
        this.router
            .route("/room-type")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ROOM_TYPE_FILES), this.roomSettingController.createRoomType)
            .get(this.roomSettingController.getAllRoomType);
        // edit and remove room type
        this.router
            .route("/room-type/:id")
            .get(this.roomSettingController.getSingleRoomType)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ROOM_TYPE_FILES), this.roomSettingController.updateRoomType)
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
exports.default = RoomSettingRouter;
//# sourceMappingURL=setting.room.router.js.map