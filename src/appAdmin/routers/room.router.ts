import AbstractRouter from "../../abstarcts/abstract.router";
import RoomController from "../controllers/room.controller";

class RoomRouter extends AbstractRouter {
	private roomController;
	constructor() {
		super();
		this.roomController = new RoomController();
		this.callRouter();
	}
	private callRouter() {
		this.router
			.route("/")
			.post(
				this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES),
				this.roomController.createroom
			)
			.get(this.roomController.getAllRoom);

		this.router
			.route("/by-status")
			.get(this.roomController.getAllRoomByRoomStatus);

		this.router
			.route("/by/room-types")
			.get(this.roomController.getAllRoomByRoomTypes);

		this.router
			.route("/search")
			.get(this.roomController.getAllAvailableRooms);

		this.router
			.route("/status/:room_id")
			.patch(this.roomController.updateHotelRoomStatus);

		this.router
			.route("/:room_id")
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES),
				this.roomController.updateHotelRoom
			)
			.delete(this.roomController.deleteHotelRoom);

		// get all occupied rooms using date
		this.router
			.route("/occupied-rooms")
			.get(this.roomController.getAllOccupiedRooms);

		// get all rooms by room type
		this.router
			.route("/:room_type_id")
			.get(this.roomController.getAllRoomByRoomType);

		// Create Multiple rooms
		this.router
			.route("/multiple-rooms")
			.post(
				this.uploader.cloudUploadRaw(this.fileFolders.ROOM_FILES),
				this.roomController.createMultipleRooms
			);
	}
}
export default RoomRouter;
