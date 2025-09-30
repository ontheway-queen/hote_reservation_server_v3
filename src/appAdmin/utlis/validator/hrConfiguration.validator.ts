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

  // create Supplier validation
  public createSupplierValidatorValidator = Joi.object({
    name: Joi.string().required(),
    phone: Joi.number().allow("").optional(),
  });

  // get all Supplier query validator
  public getAllSupplierQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update Supplier validation
  public UpdateSupplierValidator = Joi.object({
    name: Joi.string().allow("").optional(),
    phone: Joi.number().allow("").optional(),
    status: Joi.boolean().optional(),
  });

  public supplierPayment = Joi.object({
    acc_id: Joi.number().required(),
    supplier_id: Joi.number().required(),
    inv_id: Joi.number().optional(),
    paid_amount: Joi.number().required(),
    receipt_type: Joi.string().allow("invoice", "overall").required(),
    remarks: Joi.string().optional(),
    payment_date: Joi.string().required(),
  });
}
export default HRconfigurationValidator;
