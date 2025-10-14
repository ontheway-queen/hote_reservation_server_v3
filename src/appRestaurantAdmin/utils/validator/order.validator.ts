import Joi from "joi";

class RestaurantOrderValidator {
  public createOrderValidator = Joi.object({
    staff_id: Joi.number().integer().optional(),
    customer_name: Joi.string().optional(),
    customer_phone: Joi.string().optional(),
    customer_id: Joi.number().optional(),
    order_type: Joi.string()
      .valid("walk-in", "reservation-guest", "takeout", "delivery")
      .required(),

    table_id: Joi.number().integer().required(),
    discount: Joi.number().precision(2).optional().default(0),
    discount_type: Joi.string()
      .valid("percentage", "fixed")
      .optional()
      .default(null),
    service_charge: Joi.number().precision(2).required(),
    service_charge_type: Joi.string().valid("percentage", "fixed").required(),
    vat_type: Joi.string().valid("percentage", "fixed").required(),
    vat: Joi.number().precision(2).required(),
    room_no: Joi.number().optional().default(null),
    order_items: Joi.array()
      .items(
        Joi.object({
          food_id: Joi.number().integer().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
  });

  public completeOrderPaymentValidator = Joi.object({
    payable_amount: Joi.number().precision(2).required(),
    acc_id: Joi.number().optional(),
    booking_id: Joi.number().optional(),
    room_id: Joi.number().optional(),
    pay_with: Joi.string().valid("by_booking", "by_room", "instant").required(),
  });

  public updateOrderValidator = Joi.object({
    staff_id: Joi.number().integer().optional(),
    order_type: Joi.string()
      .valid("walk-in", "reservation-guest", "takeout", "delivery")
      .required(),
    guest: Joi.string().optional(),
    customer_name: Joi.string().optional(),
    customer_phone: Joi.string().optional(),
    customer_id: Joi.number().optional(),

    table_id: Joi.number().integer().required(),
    discount: Joi.number().precision(2).optional().default(0),
    discount_type: Joi.string()
      .valid("percentage", "fixed")
      .optional()
      .default(null),
    service_charge: Joi.number().precision(2).required(),
    service_charge_type: Joi.string().valid("percentage", "fixed").required(),
    vat_type: Joi.string().valid("percentage", "fixed").required(),
    vat: Joi.number().precision(2).required(),
    room_no: Joi.number().optional(),
    order_items: Joi.array()
      .items(
        Joi.object({
          food_id: Joi.number().integer().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
  });
}

export default RestaurantOrderValidator;
