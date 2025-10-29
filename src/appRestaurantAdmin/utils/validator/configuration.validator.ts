import Joi from "joi";

class RestaurantConfigurationValidator {
  public updatePrepareFoodOption = Joi.object({
    is_prepare_food_enabled: Joi.bool().required(),
  });

  public getUnitValidator = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    name: Joi.string().optional(),
    short_code: Joi.string().optional(),
  });

  public updateUnitValidator = Joi.object({
    name: Joi.string().optional(),
    short_code: Joi.string().optional(),
  });
}

export default RestaurantConfigurationValidator;
