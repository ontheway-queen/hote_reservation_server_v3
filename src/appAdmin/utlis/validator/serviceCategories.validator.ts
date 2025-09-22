import Joi from "joi";

class ServiceCategoriesValidator {
	public createServiceCategory = Joi.object({
		name: Joi.string().required(),
	});

	public getServiceCategoryQueryValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		key: Joi.string().optional(),
	});

	public updateServiceCategoryValidator = Joi.object({
		name: Joi.string().optional(),
		status: Joi.boolean().optional(),
	});
}

export default ServiceCategoriesValidator;
