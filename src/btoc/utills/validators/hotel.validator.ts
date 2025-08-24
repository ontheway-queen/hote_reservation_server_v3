import Joi from "joi";
import { title } from "process";

export class BtoHotelValidator {
  public hotelSearchValidator = Joi.object({
    client_nationality: Joi.string().required(),
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
    rooms: Joi.array()
      .items(
        Joi.object({
          adults: Joi.number().required(),
          children_ages: Joi.array().items(Joi.number()).required(),
        })
      )
      .required(),
  });

  public recheckValidator = Joi.object({
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
    room_type_id: Joi.number().required(),
    rate_plan_id: Joi.number().required(),
    rooms: Joi.array()
      .items(
        Joi.object({
          adults: Joi.number().required(),
          children_ages: Joi.array().items(Joi.number()).required(),
        })
      )
      .required(),
  });

  public bookingValidator = Joi.object({
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
}
