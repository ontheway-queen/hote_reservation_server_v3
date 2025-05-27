import Joi from "joi";
class RoomValidator {
  // create room validator
  public createRoomValidator = Joi.object({
    room_name: Joi.string().required(),
    floor_no: Joi.number().required(),
    room_type_id: Joi.number().required(),
  });

  // get all hotel room validator
  public getAllHotelRoomQueryValidator = Joi.object({
    key: Joi.string().allow("").optional(),
    availability: Joi.string().allow("").optional(),
    refundable: Joi.string().allow("").optional(),
    room_type: Joi.string().allow("").optional(),
    occupancy: Joi.string().allow("").optional(),
    child: Joi.number().allow("").optional(),
    adult: Joi.number().allow("").optional(),
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });

  // update hotel room validator
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
}
export default RoomValidator;
