import Joi from "joi";

class ProductInvValidator {
  // create product
  public createProductInvValidator = Joi.object({
    name: Joi.string().required(),
    model: Joi.string().allow("").optional(),
    category_id: Joi.number().required(),
    unit_id: Joi.number().required(),
    brand_id: Joi.number().allow("").optional(),
    details: Joi.string().allow("").optional(),
    image: Joi.string().allow("").optional(),
  });

  // get all product
  public getAllProductInvValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    key: Joi.string().allow("").optional(),
    brand: Joi.string().allow("").optional(),
    in_stock: Joi.string().allow("").optional(),
    unit: Joi.string().allow("").optional(),
    category: Joi.string().allow("").optional(),
  });

  // update product
  public updateProductInvValidator = Joi.object({
    name: Joi.string().allow("").optional(),
    model: Joi.string().allow("").optional(),
    category_id: Joi.number().allow("").optional(),
    unit_id: Joi.number().allow("").optional(),
    brand_id: Joi.number().allow("").optional(),
    details: Joi.string().allow("").optional(),
    in_stock: Joi.number().allow("").optional(),
    image: Joi.string().allow("").optional(),
  });

  // create Damaged Product
  public createDamagedProductValidator = Joi.object({
    date: Joi.date().allow("").optional(),
    damaged_items: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().required(),
          quantity: Joi.number().required(),
          note: Joi.string().allow("").optional(),
        })
      )
      .required(),
  });

  // get all Damaged Product
  public getAllDamagedProductValidator = Joi.object({
    key: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
  });
}
export default ProductInvValidator;
