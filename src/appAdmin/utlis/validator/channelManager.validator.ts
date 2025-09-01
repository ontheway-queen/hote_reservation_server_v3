import Joi from "joi";
class ChannelManagerValidator {
  public addChannelManager = Joi.object({
    name: Joi.string().required(),
    is_internal: Joi.boolean().required(),
  });

  public updateChannelManager = Joi.object({
    name: Joi.string().optional(),
    is_internal: Joi.boolean().optional(),
  });
}
export default ChannelManagerValidator;
