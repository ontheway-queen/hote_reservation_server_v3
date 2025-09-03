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

  public channelAllocation = Joi.object({
    room_type_id: Joi.number().required(),
    channel_id: Joi.number().required(),
    total_allocated_rooms: Joi.number().required(),
    from_date: Joi.string().required(),
    to_date: Joi.string().required(),
    rate_plans: Joi.array().items(Joi.number().required()).required(),
  });
}
export default ChannelManagerValidator;
