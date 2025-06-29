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
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES), this.roomController.updateHotelRoom);
    }
}
exports.default = RoomRouter;
//# sourceMappingURL=room.router.js.map