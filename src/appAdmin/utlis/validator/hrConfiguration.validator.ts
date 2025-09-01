import Joi from "joi";
class HRconfigurationValidator {
  public createShift = Joi.object({
    name: Joi.string().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
  });

  public updateShift = Joi.object({
    name: Joi.string().optional(),
    start_time: Joi.string().optional(),
    end_time: Joi.string().optional(),
  });

  public createAllowances = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().allow("percentage", "fixed").required(),
    value: Joi.number().required(),
    is_taxable: Joi.bool().required(),
  });
  public updateAllowances = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().allow("percentage", "fixed").optional(),
    value: Joi.number().optional(),
    is_taxable: Joi.bool().optional(),
  });

  public createDeductions = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().allow("percentage", "fixed").required(),
    value: Joi.number().required(),
  });

  public updateDeduction = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().allow("percentage", "fixed").optional(),
    value: Joi.number().optional(),
  });
}
export default HRconfigurationValidator;
