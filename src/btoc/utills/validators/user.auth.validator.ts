import Joi from "joi";

export class BtocUserAuthValidator {
  public registrationValidator = Joi.object({
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().max(20).allow("").optional(),
    date_of_birth: Joi.date().allow("").optional(),
    gender: Joi.string().valid("male", "female", "other").required(),
    address: Joi.string().max(1000).optional(),
    city_id: Joi.number().integer().optional(),
    country_id: Joi.number().integer().optional(),
  });

  public loginValidator = Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(20).required(),
  });
}
