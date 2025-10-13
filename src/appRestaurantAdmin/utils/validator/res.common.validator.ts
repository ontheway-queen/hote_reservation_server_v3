import Joi from "joi";

class RestaurantCommonValidator {
  getAllAccountQueryValidator = Joi.object({
    ac_type: Joi.string()
      .lowercase()
      .valid("bank", "cash", "cheque", "mobile_banking", "card")
      .optional(),
    key: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });
}

export default RestaurantCommonValidator;
