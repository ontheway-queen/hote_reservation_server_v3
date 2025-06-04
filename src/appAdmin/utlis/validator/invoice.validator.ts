import Joi from "joi";
class InvoiceValidator {
  // get all invoice validator
  public getAllInvoiceValidator = Joi.object({
    key: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
    due_inovice: Joi.string().valid("1").optional(),
    user_id: Joi.string().optional(),
  });

  // create invoice validator
  public createInvoiceValidator = Joi.object({
    user_id: Joi.number().required(),
    discount_amount: Joi.number().required(),
    tax_amount: Joi.number().required(),
    invoice_item: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          total_price: Joi.number().required(),
          quantity: Joi.number().required(),
        })
      )
      .required(),
  });

  // create folio invoice validator
  public createFolioInvoiceValidator = Joi.object({
    guest_id: Joi.number().required(),
    booking_id: Joi.number().required(),
    notes: Joi.string().optional(),
    folio_entry_ids: Joi.array()
      .items(
        Joi.object({
          folio_id: Joi.number().required(),
          entry_ids: Joi.array().items(Joi.number().required()).required(),
        })
      )
      .required(),
  });

  public getAllFolioValidator = Joi.object({
    booking_id: Joi.number().required(),
  });
}
export default InvoiceValidator;
