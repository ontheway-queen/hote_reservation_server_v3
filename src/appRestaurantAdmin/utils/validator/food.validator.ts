import Joi from "joi";

class RestaurantFoodValidator {
  public createFoodValidator = Joi.object({
    food: Joi.string()
      .required()
      .custom((value, helper) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          return helper.error("food.invalidJSON", {
            message: "Invalid JSON format",
          });
        }

        const schema = Joi.object({
          name: Joi.string().required().messages({
            "any.required": "Food name is required",
          }),
          menu_category_id: Joi.number().required().messages({
            "any.required": "Menu category ID is required",
          }),
          retail_price: Joi.number().required().messages({
            "any.required": "Retail price is required",
          }),
          measurement_per_unit: Joi.number().required().messages({
            "any.required": "Measurement per unit is required",
          }),
          unit_id: Joi.number().required().messages({
            "any.required": "Unit ID is required",
          }),
        });

        const { error, value: validated } = schema.validate(parsed);
        if (error)
          return helper.error("food.invalidData", {
            message: error.details[0].message,
          });

        return validated;
      })
      .messages({
        "any.required": "Food data is required",
        "food.invalidJSON": "{{#message}}",
        "food.invalidData": "{{#message}}",
      }),

    ingredients: Joi.string()
      .required()
      .custom((value, helper) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
          console.log({ parsed });
        } catch {
          console.log(1);
          return helper.error("ingredients.invalidJSON", {
            message: "Invalid JSON format",
          });
        }

        const schema = Joi.array()
          .items(
            Joi.object({
              product_id: Joi.number().required().messages({
                "any.required": "Product ID is required",
              }),
              quantity_per_unit: Joi.number().positive().required().messages({
                "any.required": "Product quantity is required",
                "number.positive": "Quantity must be greater than zero",
              }),
            })
          )
          .min(1)
          .required()
          .messages({
            "array.base": "Ingredients must be an array",
            "array.min": "At least one ingredient is required",
            "any.required": "Ingredients are required",
          });

        const { error, value: validated } = schema.validate(parsed);
        if (error)
          return helper.error("ingredients.invalidData", {
            message: error.details[0].message,
          });

        return validated;
      })
      .messages({
        "any.required": "Ingredients data is required",
        "ingredients.invalidJSON": "{{#message}}",
        "ingredients.invalidData": "{{#message}}",
      }),
  });

  public getFoodsValidator = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    name: Joi.string().optional(),
    category_id: Joi.number().optional(),
    status: Joi.string().valid("available", "unavailable").optional(),
  });

  public updateFoodValidator = Joi.object({
    food: Joi.string()
      .optional()
      .custom((value, helper) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          return helper.error("any.invalid");
        }

        const schema = Joi.object({
          name: Joi.string().optional(),
          menu_category_id: Joi.number().optional(),
          retail_price: Joi.number().optional(),
          measurement_per_unit: Joi.number().optional(),
          unit_id: Joi.number().optional(),
          status: Joi.string().valid("available", "unavailable").optional(),
        });

        const { error, value: validated } = schema.validate(parsed);
        if (error) return helper.error("any.invalid");

        return validated;
      }),
    ingredients: Joi.string()
      .optional()
      .custom((value, helper) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
          console.log({ parsed });
        } catch {
          console.log(1);
          return helper.error("ingredients.invalidJSON", {
            message: "Invalid JSON format",
          });
        }

        const schema = Joi.array()
          .items(
            Joi.object({
              product_id: Joi.number().required().messages({
                "any.required": "Product ID is required",
              }),
              quantity_per_unit: Joi.number().positive().required().messages({
                "any.required": "Product quantity is required",
                "number.positive": "Quantity must be greater than zero",
              }),
            })
          )
          .min(1)
          .required()
          .messages({
            "array.base": "Ingredients must be an array",
            "array.min": "At least one ingredient is required",
            "any.required": "Ingredients are required",
          });

        const { error, value: validated } = schema.validate(parsed);
        if (error)
          return helper.error("ingredients.invalidData", {
            message: error.details[0].message,
          });

        return validated;
      })
      .messages({
        "any.required": "Ingredients data is required",
        "ingredients.invalidJSON": "{{#message}}",
        "ingredients.invalidData": "{{#message}}",
      }),

    remove_ingredients: Joi.string()
      .optional()
      .custom((value, helper) => {
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          return helper.error("any.invalid");
        }
        const schema = Joi.array().items(Joi.number().optional());
        const { error, value: validated } = schema.validate(parsed);
        if (error) return helper.error("any.invalid");
        return validated;
      }),
  });
}

export default RestaurantFoodValidator;
