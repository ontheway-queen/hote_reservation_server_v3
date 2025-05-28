import Joi from "joi";
export class ReservationValidator {
  public getAvailableRoomsQueryValidator = Joi.object({
    check_in: Joi.date().required(),
    check_out: Joi.date().required(),
  });

  public createBookingValidator = Joi.object({
    reservation_type: Joi.string().valid("hold", "confirm").required(),
    is_checked_in: Joi.bool().required(),
    check_in: Joi.date().iso().required(),
    check_out: Joi.date().iso().required(),

    guest: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.string().allow("").optional(),
      phone: Joi.string().required(),
      nationality: Joi.string().required(),
    }).required(),

    pickup: Joi.boolean().required(),
    pickup_from: Joi.when("pickup", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    pickup_time: Joi.when("pickup", {
      is: true,
      then: Joi.string().isoDate().required(), // assuming ISO datetime string
      otherwise: Joi.forbidden(),
    }),

    drop: Joi.boolean().required(),
    drop_to: Joi.when("drop", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    drop_time: Joi.when("drop", {
      is: true,
      then: Joi.string().isoDate().required(),
      otherwise: Joi.forbidden(),
    }),

    discount_amount: Joi.number().min(0).required(),
    service_charge: Joi.number().min(0).required(),
    vat: Joi.number().min(0).required(),

    rooms: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().required(),
          rate_plan_id: Joi.number().required(),
          rate: Joi.object({
            base_price: Joi.number().required(),
            changed_price: Joi.number().required(),
          }).required(),
          number_of_rooms: Joi.number().min(1).required(),

          guests: Joi.array()
            .items(
              Joi.object({
                room_id: Joi.number().required(),
                adults: Joi.number().min(1).required(),
                children: Joi.number().min(0).required(),
                infant: Joi.number().min(0).required(),
              })
            )
            .min(1)
            .required(),

          meal_plans_ids: Joi.array().items(Joi.number()).optional(),
        })
      )
      .min(1)
      .required(),

    special_requests: Joi.string().allow("").optional(),

    payment: Joi.object({
      method: Joi.string().valid("cash", "card", "online").required(),
      acc_id: Joi.number().required(),
      amount: Joi.number().required(),
    }).required(),

    source_id: Joi.number().required(),
  });
}
