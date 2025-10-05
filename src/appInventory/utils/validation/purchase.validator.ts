import Joi from "joi";

class PurchaseInvValidator {
  // create purchase
  public createPurchaseInvValidator = Joi.object({
    supplier_id: Joi.number().required(),
    purchase_date: Joi.date().required(),
    ac_tr_ac_id: Joi.number().required(),
    vat: Joi.number().allow("").optional().default(0),
    shipping_cost: Joi.number().allow("").optional().default(0),
    discount_amount: Joi.number().allow("").optional().default(0),
    paid_amount: Joi.number().allow("").optional().default(0),
    purchase_items: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().required(),
          product_name: Joi.string().required(),
          quantity: Joi.number().required(),
          price: Joi.number().required(),
        })
      )
      .required(),
  });

  // get all purchase
  public getAllPurchaseInvValidator = Joi.object({
    key: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    supplier_id: Joi.number().allow("").optional(),
    due: Joi.number().allow("").optional(),
  });
}
export default PurchaseInvValidator;
