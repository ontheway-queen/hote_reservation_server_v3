import Joi from "joi";

export class BtocPaymentValidator {
  // Helper: Parse and validate JSON strings
  private parseJson = (schema: Joi.Schema) => {
    return Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = schema.validate(parsed, { abortEarly: false });
        if (error) {
          return helpers.error("any.invalid", { message: error.message });
        }
        return parsed;
      } catch {
        return helpers.error("any.invalid", { message: "Invalid JSON format" });
      }
    }, "Custom JSON parsing");
  };

  public createSurjopayPaymentOrder = Joi.object({
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
    room_type_id: Joi.number().required(),
    rate_plan_id: Joi.number().required(),

    rooms: Joi.alternatives()
      .try(
        Joi.array().items(
          Joi.object({
            adults: Joi.number().required(),
            children_ages: Joi.array().items(Joi.number()).required(),
            paxes: Joi.array().items(
              Joi.object({
                type: Joi.string().valid("AD", "CH").required(),
                title: Joi.string()
                  .valid("Mr.", "Ms.", "Mrs.", "Mstr.")
                  .required(),
                name: Joi.string().required(),
                surname: Joi.string().required(),
              })
            ),
          })
        ),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            return parsed;
          } catch (err) {
            return helpers.error("any.invalid");
          }
        })
      )
      .required(),

    special_requests: Joi.string().allow(""),

    holder: Joi.alternatives()
      .try(
        Joi.object({
          title: Joi.string().valid("Mr.", "Ms.", "Mrs.", "Mstr.").required(),
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          email: Joi.string().email().required(),
          phone: Joi.string().required(),
          address: Joi.string().required(),
          client_nationlity: Joi.string().allow("").optional(),
        }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            return parsed;
          } catch (err) {
            return helpers.error("any.invalid");
          }
        })
      )
      .required(),
  });

  public paymentQueryValidator = Joi.object({
    gateway_name: Joi.string().valid("surjopay", "brac").required(),
    is_app: Joi.string().optional(),
    payment_for: Joi.string()
      .valid("hotel", "flight", "tour", "visa")
      .required(),
  });
}
