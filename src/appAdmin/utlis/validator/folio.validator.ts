import Joi from "joi";
export class FolioValidator {
  public createFolio = Joi.object({
    booking_id: Joi.number().required(),
    name: Joi.string().required(),
  });
}
