import Joi from "joi";

class MHotelValidator {
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
    website_url: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    fax: Joi.string().allow("").optional(),
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

  public updateHotelValidator = Joi.object({
    name: Joi.string().optional(),
    expiry_date: Joi.date().optional(),
    status: Joi.bool().optional(),
    hotel_email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .regex(/^\S/)
      .optional(),
    description: Joi.string().allow("").optional(),
    accommodation_type_id: Joi.number().optional(),
    chain_name: Joi.string().allow("").optional(),
    latitude: Joi.string().allow("").optional(),
    longitude: Joi.string().allow("").optional(),
    star_category: Joi.number().integer().optional(),
    postal_code: Joi.number().allow().optional(),
    address: Joi.string().allow("").optional(),
    city_code: Joi.number().optional(),
    country_code: Joi.string().optional(),
    website_url: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    fax: Joi.string().allow("").optional(),
    remove_hotel_images: Joi.array().items(Joi.number().required()).optional(),
  });

  public getAllHotelValidator = Joi.object({
    name: Joi.string().optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    group: Joi.string().optional(),
    city: Joi.string().optional(),
    status: Joi.string().optional(),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
  });
}

export default MHotelValidator;
