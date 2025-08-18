import Joi from "joi";

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
}
