import Joi from "joi";
export class FolioValidator {
  public createFolio = Joi.object({
    booking_id: Joi.number().required(),
    name: Joi.string().required(),
  });

  public splitMasterFolio = Joi.object({
    booking_id: Joi.number().required(),
    from_folio_id: Joi.number().required(),
    to_folio_ids: Joi.array().items(Joi.number().required()),
    amount: Joi.number().required(),
  });
}
