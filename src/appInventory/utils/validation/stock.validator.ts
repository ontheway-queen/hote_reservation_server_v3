import Joi from "joi";

class StockInvValidator {

    // create Stock
    public createstockInvValidator = Joi.object({
        stock_in: Joi.number().allow("").optional(),
        stock_out: Joi.number().allow("").optional(),
        ac_tr_ac_id: Joi.number().allow("").optional(),
        paid_amount: Joi.number().allow("").optional(),
        note: Joi.string().allow("").optional(),
        stock_items: Joi.array()
        .items(
            Joi.object({
            product_id: Joi.number().required(),
            quantity: Joi.number().required(),
            })
        )
        .required(),
    });

    // get all Stock
    public getAllStockInvValidator = Joi.object({
        key: Joi.string().allow("").optional(),
        status: Joi.string().allow("").optional(),
        limit: Joi.string().allow("").optional(),
        skip: Joi.string().allow("").optional(),
    });

}
export default StockInvValidator;