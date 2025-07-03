import Joi from "joi";
class RoomValidator {
	public createRoomValidator = Joi.object({
		room_name: Joi.string().required(),
		floor_no: Joi.number().required(),
		room_type_id: Joi.number().required(),
	});

	public getAllHotelRoomQueryValidator = Joi.object({
		search: Joi.string().allow("").optional(),
		room_type_id: Joi.number().allow("").optional(),
		occupancy: Joi.string().allow("").optional(),
		status: Joi.string().allow("").optional(),
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
	});

	public getAllHotelRoomByRoomStatusQueryValidator = Joi.object({
		room_type_id: Joi.number().allow("").optional(),
		current_date: Joi.string().required(),
		status: Joi.string().allow("").optional(),
	});

	public updateRoomValidator = Joi.object({
		room_name: Joi.string().optional(),
		floor_no: Joi.number().optional(),
		room_type_id: Joi.number().optional(),
	});

	public updateRoomStatusValidator = Joi.object({
		status: Joi.string()
			.allow(
				"in_service",
				"out_of_service",
				"clean",
				"dirty",
				"under_maintenance"
			)
			.required(),
	});

	public getAllOccupiedRoomsQueryValidator = Joi.object({
		date: Joi.string().required(),
	});
}
export default RoomValidator;
