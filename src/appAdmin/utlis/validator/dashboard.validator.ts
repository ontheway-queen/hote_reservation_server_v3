import Joi from "joi";

class DashBoardValidator {
  public getAllAmountQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
  });

  public getAllAccountQueryValidator = Joi.object({
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    ac_type: Joi.string().allow("").required(),
  });

  public getGuestReport = Joi.object({
    current_date: Joi.string().required(),
    booking_mode: Joi.string().valid("arrival", "departure", "stay").required(),
  });

  public getGuegetInhouseGuestListReportstReport = Joi.object({
    current_date: Joi.string().required(),
    room_id: Joi.string().allow("").optional(),
    search: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });

  public departureRoomListReport = Joi.object({
    current_date: Joi.string().required(),
    room_id: Joi.string().allow("").optional(),
    search: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });

  public getAllRoomsQueryValidator = Joi.object({
    current_date: Joi.string().required(),
  });
}
export default DashBoardValidator;
