import Joi from "joi";
class RoomValidator {
	public createRoomValidator = Joi.object({
		room_name: Joi.string().required(),
		floor_no: Joi.number().required(),
		room_type_id: Joi.number().required(),
	});

	public createMultipleRoomValidator = Joi.object({
		from_room: Joi.string().required(),
		to_room: Joi.string().required(),
		floor_no: Joi.number().required(),
		room_type_id: Joi.number().required(),
	})
		.custom((value, helpers) => {
			const from = parseInt(value.from_room, 10);
			const to = parseInt(value.to_room, 10);

			if (isNaN(from) || isNaN(to)) {
				return helpers.error("any.invalid_from_to_room");
			}
			if (from < 0 || to < 0) {
				return helpers.error("any.negative_room_numbers");
			}
			if (to <= from) {
				return helpers.error("any.to_less_than_from");
			}

			return value;
		})
		.messages({
			"any.invalid_from_to_room": `"from_room" and "to_room" must be valid numbers`,
			"any.to_less_than_from": `"to_room" must be greater than "from_room"`,
			"any.negative_room_numbers": `"from_room" and "to_room" must be greater than or equal to 0`,
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
