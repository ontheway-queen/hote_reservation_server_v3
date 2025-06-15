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

  public getAllRoomsQueryValidator = Joi.object({
    current_date: Joi.string().required(),
  });
}
export default DashBoardValidator;
