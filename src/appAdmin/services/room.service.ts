import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	IcreateRoomBody,
	IupdateRoomBody,
} from "../utlis/interfaces/Room.interfaces";

export class RoomService extends AbstractServices {
	constructor() {
		super();
	}

	// public async createRoom(req: Request) {
	//   return await this.db.transaction(async (trx) => {
	//     const { room_type_id, room_name } = req.body as IcreateRoomBody;
	//     const { hotel_code, id: user_id } = req.hotel_admin;

	//     const settingModel = this.Model.settingModel(trx);
	//     const roomModel = this.Model.RoomModel(trx);

	//     const checkRoomType = await settingModel.getSingleRoomType(
	//       room_type_id,
	//       hotel_code
	//     );
	//     if (!checkRoomType.length) {
	//       return {
	//         success: false,
	//         code: this.StatusCode.HTTP_NOT_FOUND,
	//         message: "Room type is not found",
	//       };
	//     }

	//     // Check for duplicate room name
	//     const { data: duplicateRooms } = await roomModel.getAllRoom({
	//       hotel_code,
	//       exact_name: room_name,
	//     });

	//     if (duplicateRooms.length > 0) {
	//       return {
	//         success: false,
	//         code: this.StatusCode.HTTP_CONFLICT,
	//         message: "Room name already exists",
	//       };
	//     }

	//     //  Insert new room
	//     await roomModel.createRoom({
	//       ...req.body,
	//       hotel_code,
	//       created_by: user_id,
	//     });

	//     const roomAvaibilityPayload = [] as {
	//       hotel_code: number;
	//       room_type_id: number;
	//       date: string;
	//       available_rooms: number;
	//       total_rooms: number;
	//     }[];

	//     for (let i = 0; i < 365; i++) {
	//       const date = new Date();
	//       date.setUTCDate(date.getUTCDate() + i);
	//       const dateStr = date.toISOString().split("T")[0];

	//       roomAvaibilityPayload.push({
	//         hotel_code,
	//         room_type_id,
	//         date: dateStr,
	//         available_rooms: 1,
	//         total_rooms: 1,
	//       });
	//     }

	//     await roomModel.insertInRoomAvilabilities(roomAvaibilityPayload);

	//     return {
	//       success: true,
	//       code: this.StatusCode.HTTP_SUCCESSFUL,
	//       message: "Room created successfully.",
	//     };
	//   });
	// }

	public async createRoom(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { room_type_id, room_name } = req.body as IcreateRoomBody;
			const { hotel_code, id: user_id } = req.hotel_admin;

			const settingModel = this.Model.settingModel(trx);
			const roomModel = this.Model.RoomModel(trx);

			const checkRoomType = await settingModel.getSingleRoomType(
				room_type_id,
				hotel_code
			);
			if (!checkRoomType.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Room type is not found",
				};
			}

			// Check for duplicate room name
			const { data: duplicateRooms } = await roomModel.getAllRoom({
				hotel_code,
				exact_name: room_name,
			});

			if (duplicateRooms.length > 0) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Room name already exists",
				};
			}

			//  Insert new room
			await roomModel.createRoom({
				...req.body,
				hotel_code,
				created_by: user_id,
			});

			// Handle room availability
			const availability =
				await roomModel.getRoomAvailabilitiesByRoomTypeId(
					hotel_code,
					room_type_id
				);

			if (availability) {
				await roomModel.updateInRoomAvailabilities(
					hotel_code,
					room_type_id,
					{
						available_rooms: availability.available_rooms + 1,
						total_rooms: availability.total_rooms + 1,
					}
				);
			} else {
				const roomAvaibilityPayload = [] as {
					hotel_code: number;
					room_type_id: number;
					date: string;
					available_rooms: number;
					total_rooms: number;
				}[];
				for (let i = 0; i < 365; i++) {
					const date = new Date();
					date.setUTCDate(date.getUTCDate() + i);
					const dateStr = date.toISOString().split("T")[0];

					console.log({ dateStr });
					roomAvaibilityPayload.push({
						hotel_code,
						room_type_id,
						date: dateStr,
						available_rooms: 1,
						total_rooms: 1,
					});
				}
				await roomModel.insertInRoomAvilabilities(
					roomAvaibilityPayload
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Room created successfully.",
			};
		});
	}

	public async getAllRoom(req: Request) {
		const { search, limit, skip, room_type_id, status } = req.query;

		const { hotel_code } = req.hotel_admin;

		const { data, total } = await this.Model.RoomModel().getAllRoom({
			search: search as string,
			limit: limit as string,
			status: status as string,
			skip: skip as string,
			hotel_code,
			room_type_id: parseInt(room_type_id as string),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getAllRoomByRoomStatus(req: Request) {
		const { search, limit, skip, room_type_id, status } = req.query;

		const { hotel_code } = req.hotel_admin;

		const { data, total } =
			await this.Model.RoomModel().getAllRoomByRoomStatus({
				limit: limit as string,
				status: status as string,
				skip: skip as string,
				hotel_code,
				room_type_id: parseInt(room_type_id as string),
				current_date: req.query.current_date as string,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getAllRoomByRoomTypes(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { data, total } =
			await this.Model.RoomModel().getAllRoomByRoomTypes({
				hotel_code,
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getAllAvailableRooms(req: Request) {
		const { hotel_code } = req.hotel_admin;

		const { data, total } =
			await this.Model.RoomModel().getAllAvailableRooms({
				hotel_code,
				check_in: req.query.check_in as string,
				check_out: req.query.check_out as string,
				adult: parseInt(req.query.adult as string),
				child: parseInt(req.query.child as string),
			});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// update hotel room
	public async updateroom(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code } = req.hotel_admin;
			const { room_id } = req.params;
			const { room_name, room_type_id } = req.body as IupdateRoomBody;

			const settingModel = this.Model.settingModel(trx);
			const roomModel = this.Model.RoomModel(trx);

			const existingRoom = await roomModel.getSingleRoom(
				hotel_code,
				parseInt(room_id)
			);

			if (!existingRoom.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			if (room_name) {
				const { data: roomsWithSameName } = await roomModel.getAllRoom({
					hotel_code,
					exact_name: room_name,
				});
				if (roomsWithSameName.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_CONFLICT,
						message: "Room name already exists",
					};
				}
			}

			const { room_type_id: exist_room_type_id } = existingRoom[0];

			if (room_type_id && exist_room_type_id !== room_type_id) {
				const exRoomAvailability =
					await roomModel.getRoomAvailabilitiesByRoomTypeId(
						hotel_code,
						exist_room_type_id
					);
				console.log({ exRoomAvailability });
				const newGivenRoomTypesRoomAvailability =
					await roomModel.getRoomAvailabilitiesByRoomTypeId(
						hotel_code,
						room_type_id
					);

				if (newGivenRoomTypesRoomAvailability) {
					await roomModel.updateInRoomAvailabilities(
						hotel_code,
						room_type_id,
						{
							total_rooms:
								newGivenRoomTypesRoomAvailability.total_rooms +
								1,
							available_rooms:
								newGivenRoomTypesRoomAvailability.available_rooms +
								1,
						}
					);
				} else {
					const roomAvaibilityPayload = [] as {
						hotel_code: number;
						room_type_id: number;
						date: string;
						available_rooms: number;
						total_rooms: number;
					}[];
					for (let i = 0; i < 365; i++) {
						const date = new Date();
						date.setUTCDate(date.getUTCDate() + i);
						const dateStr = date.toISOString().split("T")[0];

						console.log({ dateStr });
						roomAvaibilityPayload.push({
							hotel_code,
							room_type_id,
							date: dateStr,
							available_rooms: 1,
							total_rooms: 1,
						});
					}
					await roomModel.insertInRoomAvilabilities(
						roomAvaibilityPayload
					);
				}

				await roomModel.updateInRoomAvailabilities(
					hotel_code,
					exist_room_type_id,
					{
						total_rooms: exRoomAvailability.total_rooms - 1,
						available_rooms: exRoomAvailability.available_rooms - 1,
					}
				);

				req.body["room_type_id"] = room_type_id;
			}

			await roomModel.updateRoom(parseInt(room_id), hotel_code, req.body);

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: "Room updated successfully",
			};
		});
	}

	// update room by status
	public async updateRoomStatus(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { room_id } = req.params;
			const { hotel_code } = req.hotel_admin;
			const { status } = req.body as {
				status:
					| "in_service"
					| "out_of_service"
					| "clean"
					| "dirty"
					| "under_maintenance";
			};

			const roomModel = this.Model.RoomModel(trx);

			const roomId = parseInt(room_id);
			const existingRoom = await roomModel.getSingleRoom(
				hotel_code,
				roomId
			);

			if (!existingRoom.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			const currentRoom = existingRoom[0];
			const currentStatus = currentRoom.status;

			if (currentStatus === status) {
				return {
					success: true,
					code: this.StatusCode.HTTP_OK,
					message: `Room is already marked as ${status}.`,
				};
			}

			const availability =
				await roomModel.getRoomAvailabilitiesByRoomTypeId(
					hotel_code,
					currentRoom.room_type_id
				);

			if (
				currentStatus != "out_of_service" &&
				status === "out_of_service"
			) {
				await roomModel.updateInRoomAvailabilities(
					hotel_code,
					currentRoom.room_type_id,
					{
						total_rooms: availability.total_rooms - 1,
						available_rooms: availability.available_rooms - 1,
					}
				);
			} else if (
				currentStatus == "out_of_service" &&
				status === "in_service"
			) {
				// Going back to in_service: increase availability

				await roomModel.updateInRoomAvailabilities(
					hotel_code,
					currentRoom.room_type_id,
					{
						total_rooms: availability.total_rooms + 1,
						available_rooms: availability.available_rooms + 1,
					}
				);
			}

			// Update the room status
			await roomModel.updateRoom(roomId, hotel_code, { status });

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: `Room status updated to ${status}.`,
			};
		});
	}

	public async deleteHotelRoom(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { room_id } = req.params;
			const { hotel_code } = req.hotel_admin;

			const roomModel = this.Model.RoomModel(trx);

			const roomId = parseInt(room_id);
			const existingRoom = await roomModel.getSingleRoom(
				hotel_code,
				roomId
			);
			console.log({ existingRoom });
			if (!existingRoom.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: this.ResMsg.HTTP_NOT_FOUND,
				};
			}

			const currentRoom = existingRoom[0];

			const availability =
				await roomModel.getRoomAvailabilitiesByRoomTypeId(
					hotel_code,
					currentRoom.room_type_id
				);

			await roomModel.updateInRoomAvailabilities(
				hotel_code,
				currentRoom.room_type_id,
				{
					total_rooms: availability.total_rooms - 1,
					available_rooms: availability.available_rooms - 1,
				}
			);

			// Update the room status
			await roomModel.updateRoom(roomId, hotel_code, {
				is_deleted: true,
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: `Room has been deleted`,
			};
		});
	}

	// get all rooms by room type
	public async getAllRoomByRoomType(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const id = req.params.room_type_id;
		const model = this.Model.RoomModel();
		const data = await model.getAllRoomByRoomType(hotel_code, Number(id));
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	}

	// get all occupied rooms using date
	public async getAllOccupiedRooms(req: Request) {
		const date = req.query.date as string;

		const model = this.Model.RoomModel();

		const data = await model.getAllOccupiedRooms(date);
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...data,
		};
	}
}
export default RoomService;
