import Joi from "joi";

class RestaurantTableValidator {
  public createTableValidator = Joi.object({
    name: Joi.string().required(),
    capacity: Joi.number().required(),
    floor_id: Joi.number().required(),
  });

  public getTablesValidator = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    name: Joi.string().optional(),
    status: Joi.string().valid("available", "booked", "maintenance").optional(),
  });

  public updateTableValidator = Joi.object({
    name: Joi.string().optional(),
    capacity: Joi.number().optional(),
    category: Joi.string().valid("in-dine", "takeout", "delivery").optional(),
  });
}

export default RestaurantTableValidator;
