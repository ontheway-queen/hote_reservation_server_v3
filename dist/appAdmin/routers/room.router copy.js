"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const room_controller_1 = __importDefault(require("../controllers/room.controller"));
class RoomRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.roomController = new room_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES), this.roomController.createroom)
            .get(this.roomController.getAllRoom);
        this.router
            .route("/multiple-rooms")
            .post(this.roomController.createMultipleRooms);
        this.router
            .route("/by-status")
            .get(this.roomController.getAllRoomByRoomStatus);
        this.router
            .route("/by/room-types")
            .get(this.roomController.getAllRoomByRoomTypes);
        this.router.route("/search").get(this.roomController.getAllAvailableRooms);
        this.router
            .route("/status/:room_id")
            .patch(this.roomController.updateHotelRoomStatus);
        this.router
            .route("/:room_id")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES), this.roomController.updateHotelRoom)
            .delete(this.roomController.deleteHotelRoom);
        // get all occupied rooms using date
        this.router
            .route("/occupied-rooms")
            .get(this.roomController.getAllOccupiedRooms);
        // get all rooms by room type
        this.router
            .route("/by/room-type/:room_type_id")
            .get(this.roomController.getAllRoomByRoomType);
    }
}
exports.default = RoomRouter;
//# sourceMappingURL=room.router%20copy.js.map