import Joi from "joi";
class HotelRestaurantReportValidator {
	public getRestaurantSalesReport = Joi.object({
		from_date: Joi.string().optional(),
		to_date: Joi.string().optional(),
		order_type: Joi.string().optional(),
		limit: Joi.string().optional(),
		skip: Joi.string().optional(),
		restaurant_id: Joi.string().required(),
	});
}
export default HotelRestaurantReportValidator;
