import Joi from "joi";
import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
} from "../../../utils/miscellaneous/constants";

export default class AdminBtocHandlerValidator {
  updateBtocSiteConfig = Joi.object({
    hero_quote: Joi.string().optional(),
    hero_sub_quote: Joi.string().optional(),
    site_name: Joi.string().optional(),

    emails: Joi.alternatives()
      .try(
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) throw new Error("Not an array");
            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        }),
        Joi.array().items(
          Joi.object({
            email: Joi.string().email().required(),
          })
        )
      )
      .optional(),

    numbers: Joi.alternatives()
      .try(
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) throw new Error("Not an array");
            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        }),
        Joi.array().items(
          Joi.object({
            number: Joi.string()
              .pattern(/^\+?\d+$/)
              .required(),
          })
        )
      )
      .optional(),

    address: Joi.alternatives()
      .try(
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) throw new Error("Not an array");
            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        }),
        Joi.array().items(
          Joi.object({
            title: Joi.string().optional(),
            address: Joi.string().optional(),
          })
        )
      )
      .optional(),

    contact_us_content: Joi.string().optional(),
    about_us_content: Joi.string().optional(),
    privacy_policy_content: Joi.string().optional(),
    terms_and_conditions_content: Joi.string().optional(),
    meta_title: Joi.string().optional(),
    meta_description: Joi.string().optional(),
    meta_tags: Joi.string().optional(),
    notice: Joi.string().optional(),
    android_app_link: Joi.string().optional(),
    ios_app_link: Joi.string().optional(),
  });

  public updatePopUpBanner = Joi.object({
    title: Joi.string().optional(),
    // thumbnail: Joi.string().optional(),
    description: Joi.string().optional(),
    status: Joi.boolean().optional(),
    link: Joi.string().optional(),
  });

  public createHeroBGContent = Joi.object({
    type: Joi.string().valid(CONTENT_TYPE_PHOTO, CONTENT_TYPE_VIDEO).required(),
    quote: Joi.string().optional().trim(),
    sub_quote: Joi.string().optional().trim(),
    tab: Joi.string().valid("HOTEL").optional(),
  });

  public updateHeroBGContent = Joi.object({
    type: Joi.string().valid(CONTENT_TYPE_PHOTO, CONTENT_TYPE_VIDEO).optional(),
    quote: Joi.string().optional().trim(),
    sub_quote: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
    tab: Joi.string().valid("HOTEL").optional(),
  });

  public updateSocialLinks = Joi.object({
    id: Joi.number().required(),
    media: Joi.string().optional(),
    link: Joi.string().optional(),
    order_number: Joi.number().optional(),
    status: Joi.boolean().optional(),
    // icon: Joi.string()
  });

  public updateHotDeals = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().optional(),
    status: Joi.boolean().optional(),
    link: Joi.string().optional(),
    order_number: Joi.string().optional(),
    // thumbnail: Joi.string().optional(),
  });

  public updatePopularRoomTypes = Joi.object({
    id: Joi.number().required(),
    room_type_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
    order_number: Joi.string().optional(),
    // thumbnail: Joi.string().optional(),
  });
}
