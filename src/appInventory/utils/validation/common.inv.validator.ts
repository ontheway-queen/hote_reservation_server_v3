import Joi from "joi";

class CommonInvValidator {
  //=================== Common Modules ======================//

  // create Common validation
  public createCommonModuleValidator = Joi.object({
    name: Joi.string().messages({
      "string.base": "Name must be a string",
    }),
    short_code: Joi.string().when(Joi.ref("$short_code_exists"), {
      is: true,
      then: Joi.required().messages({
        "any.required": "Short code cannot be empty",
      }),
      otherwise: Joi.optional(),
    }),
  });

  // get all Common query validator
  public getAllCommonModuleQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update Common validation
  public UpdateCommonModuleValidator = Joi.object({
    name: Joi.string().allow("").optional(),
    short_code: Joi.string().allow("").optional(),
    status: Joi.number().valid(0, 1).optional(),
  });
}
export default CommonInvValidator;
