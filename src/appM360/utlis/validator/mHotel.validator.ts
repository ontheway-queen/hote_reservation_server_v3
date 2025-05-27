import Joi from "joi";

class MHotelValidator {
  // create hotel input validator
  public createHotelValidator = Joi.object({
    hotel_name: Joi.string().required(),
    hotel_email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .regex(/^\S/)
      .required(),
    description: Joi.string().allow("").optional(),
    accommodation_type_id: Joi.number().required(),
    chain_name: Joi.string().allow("").optional(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    star_category: Joi.number().integer().required(),
    postal_code: Joi.number().allow().optional(),
    address: Joi.string().required(),
    city_code: Joi.number().required(),
    country_code: Joi.string().required(),
    expiry_date: Joi.date().required(),
    user_name: Joi.string().lowercase().trim().regex(/^\S/).required(),
    password: Joi.string().trim().regex(/^\S/).required(),
    permission: Joi.string().lowercase().optional(),
  });

  // update hotel input validator
  public updateHotelValidator = Joi.object({
    name: Joi.string().optional(),
    expiry_date: Joi.date().optional(),
  });

  // get all hotel validator
  public getAllHotelValidator = Joi.object({
    name: Joi.string().optional(),
    group: Joi.string().optional(),
    city: Joi.string().optional(),
    status: Joi.string()
      .valid("active", "inactive", "blocked", "expired")
      .optional(),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
  });
}

export default MHotelValidator;
