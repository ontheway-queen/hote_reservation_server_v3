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
    search: Joi.string().allow("").optional(),
    room_type_id: Joi.number().allow("").optional(),
    occupancy: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
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
