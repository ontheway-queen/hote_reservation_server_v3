import Joi from "joi";
export class ReservationValidator {
  public getAvailableRoomsValidator = Joi.object({
    booking_type: Joi.string().allow("single", "group").required(),
    check_in: Joi.date().required(),
    check_out: Joi.date().required(),
    rooms: Joi.array().items(
      Joi.object({
        adults: Joi.number().required(),
        children: Joi.number().required(),
        children_ages: Joi.array().items(Joi.number().required()).optional(),
      })
    ),
  });

  public createBookingValidator = Joi.object({
    hotel_code: Joi.string().required(),
    check_in: Joi.date().iso().required(),
    check_out: Joi.date().iso().required(),
    booking_source: Joi.string().required(),
    special_requests: Joi.string().allow("").optional(),

    guest: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      nationality: Joi.string().required(),
    }).required(),

    rooms: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().required(),
          rate_plan_id: Joi.number().required(),
          number_of_rooms: Joi.number().min(1).required(),

          guests: Joi.array()
            .items(
              Joi.object({
                adults: Joi.number().min(1).required(),
                children: Joi.number().min(0).required(),
              })
            )
            .min(1)
            .required(),

          cancellation_policy: Joi.object({
            cancellation_policy_id: Joi.number().required(),
            cancellation_policy_name: Joi.string().required(),
            cancellation_policy_details: Joi.array()
              .items(
                Joi.object({
                  fee_type: Joi.string()
                    .valid("fixed", "percentage")
                    .required(),
                  fee_value: Joi.number().required(),
                  rule_type: Joi.string()
                    .valid("free", "charge", "no_show")
                    .required(),
                  days_before: Joi.number().min(0).required(),
                  cancellation_policy_id: Joi.number().required(),
                })
              )
              .min(1)
              .required(),
          }).required(),

          meal_plans: Joi.array()
            .items(
              Joi.object({
                meal_plan_item_id: Joi.number().required(),
                meal_plan_name: Joi.string().required(),
                included: Joi.boolean().required(),
                price: Joi.number().required(),
                vat: Joi.number().min(0).required(),
              })
            )
            .optional(),

          rate_breakdown: Joi.array()
            .items(
              Joi.object({
                base_rate: Joi.number().required(),
                extra_adult_charge: Joi.number().required(),
                extra_child_charge: Joi.number().required(),
                total_rate: Joi.number().required(),
              })
            )
            .min(1)
            .required(),

          total_price: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
  });
}
