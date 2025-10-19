import Joi from "joi";
class HotelRestaurantReportValidator {
  public getRestaurantSalesReport = Joi.object({
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
    order_type: Joi.string().allow("", "walk-in", "reservation").optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    restaurant_id: Joi.string().required(),
  });

  public getUsersSaleReportValidator = Joi.object({
    restaurant_id: Joi.number().required(),
    user_id: Joi.number().optional(),
    from_date: Joi.string().optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    to_date: Joi.string().optional(),
  });

  public getDailyReportValidator = Joi.object({
    restaurant_id: Joi.number().required(),
    order_type: Joi.string().allow("", "walk-in", "reservation").optional(),
    from_date: Joi.string().required(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    to_date: Joi.string().required(),
  });

  public getProductsReportValidator = Joi.object({
    restaurant_id: Joi.number().required(),
    from_date: Joi.string().required().label("From Date"),
    to_date: Joi.string()
      .required()
      .label("To Date")
      .custom((value, helpers) => {
        const { from_date } = helpers.state.ancestors[0];
        if (!from_date) return value;

        const fromDateObj = new Date(from_date);
        const toDateObj = new Date(value);

        if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
          return helpers.error("any.invalid", {
            message: "Invalid date format",
          });
        }

        if (toDateObj <= fromDateObj) {
          return helpers.error("any.invalid", {
            message: "To Date must be greater than From Date",
          });
        }

        return value;
      }),
    name: Joi.string().optional(),
    category: Joi.string().optional(),
  });
}
export default HotelRestaurantReportValidator;
