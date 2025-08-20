import Joi, { build } from "joi";
import {
  PAYMENT_CHARGE_TYPE,
  PAYMENT_TYPE,
} from "../interfaces/payment.gateway.interface";

class SettingValidator {
  // create room Type validation
  public createRoomTypeValidator = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    categories_type_id: Joi.number().required(),
    area: Joi.number().required(),
    room_info: Joi.string().required(),
    rt_amenities: Joi.string().required(),
    bed_count: Joi.number().optional(),
    beds: Joi.alternatives()
      .try(
        Joi.array().items(
          Joi.object({
            bed_type_id: Joi.number().required(),
            quantity: Joi.number().min(1).required(),
          })
        ),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);

            if (!Array.isArray(parsed)) return helpers.error("any.invalid");

            for (const item of parsed) {
              if (
                typeof item !== "object" ||
                typeof item.bed_type_id !== "number" ||
                typeof item.quantity !== "number" ||
                item.quantity < 1
              ) {
                return helpers.error("any.invalid");
              }
            }

            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        })
      )
      .required(),
  });

  // create room Type Categories  validation
  public createRoomTypeCategoriesValidator = Joi.object({
    name: Joi.string().required(),
  });

  // get all room Type query validator
  public getAllRoomTypeQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    search: Joi.string().allow("").optional(),
    is_active: Joi.boolean().optional(),
  });

  // update room type validation
  public updateRoomTypeValidator = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    categories_type_id: Joi.number().optional(),
    base_occupancy: Joi.number().optional(),
    max_occupancy: Joi.number().optional(),
    max_adults: Joi.number().optional(),
    max_children: Joi.number().optional(),
    bed_count: Joi.number().optional(),
    area: Joi.number().optional(),
    room_info: Joi.string().optional(),
    rt_amenities: Joi.string().optional(),
    beds: Joi.alternatives()
      .try(
        Joi.array().items(
          Joi.object({
            bed_type_id: Joi.number().required(),
            quantity: Joi.number().min(1).required(),
          })
        ),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);

            if (!Array.isArray(parsed)) return helpers.error("any.invalid");

            for (const item of parsed) {
              if (
                typeof item !== "object" ||
                typeof item.bed_type_id !== "number" ||
                typeof item.quantity !== "number" ||
                item.quantity < 1
              ) {
                return helpers.error("any.invalid");
              }
            }

            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    remove_beds: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().required()),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);

            if (!Array.isArray(parsed)) {
              return helpers.error("any.invalid");
            }

            if (
              parsed.some((item) => typeof item !== "number" || isNaN(item))
            ) {
              return helpers.error("any.invalid");
            }

            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    remove_photos: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().required()),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);

            if (!Array.isArray(parsed)) {
              return helpers.error("any.invalid");
            }

            if (
              parsed.some((item) => typeof item !== "number" || isNaN(item))
            ) {
              return helpers.error("any.invalid");
            }

            return parsed;
          } catch {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
  });

  // update room type Categories validation
  public UpdateRoomTypeCategoriesValidator = Joi.object({
    name: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
  });

  //=================== Bed Type validation ======================//

  // create bed Type validation
  public createBedTypeValidator = Joi.object({
    name: Joi.string().required(),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
    unit: Joi.string().optional(),
  });

  // get all Bed Type query validator
  public getAllBedTypeQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    bed_type: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update bed type validation
  public UpdateBedTypeValidator = Joi.object({
    name: Joi.string().optional(),
    width: Joi.number().allow("").optional(),
    height: Joi.number().allow("").optional(),
    unit: Joi.string().allow("").optional(),
    status: Joi.boolean().optional(),
  });

  //=================== Bank Name validation ======================//

  // create Bank Name
  public createBankNameValidator = Joi.object({
    name: Joi.string().allow("").required(),
  });

  // get all Bank Name
  public getAllBankNameQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
  });

  // update Bank Name
  public UpdateBankNameValidator = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //=================== designation validation ======================//

  // create designation validation
  public createdesignationValidator = Joi.object({
    name: Joi.string().allow("").required(),
  });

  // get all designation query validation
  public getAlldesignationQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update designation validation
  public UpdatedesignationValidator = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //=================== department validation ======================//

  // create department validation
  public createdepartmentValidator = Joi.object({
    name: Joi.string().allow("").required(),
  });

  // get all department query validation
  public getAlldepartmentQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update department validation
  public UpdatedepatmentValidator = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //=================== Hall Amenities validation ======================//

  // create Hall Amenities validation
  public createHallAmenitiesValidator = Joi.object({
    name: Joi.string().allow("").required(),
    description: Joi.string().allow("").optional(),
  });

  // get all Hall Amenities query validator
  public getAllHallAmenitiesQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
    status: Joi.string().allow("").optional(),
  });

  // update Hall Amenities validation
  public UpdateHallAmenitiesValidator = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //=================== PayRoll Months validation ======================//

  // create PayRoll Months validation
  public createPayRollMonthsValidator = Joi.object({
    month_id: Joi.number().min(1).max(12).required(),
    days: Joi.number().min(1).max(31).required(),
    hours: Joi.number().required(),
  });

  // get all PayRoll Months query validation
  public getAllPayrollMonthsQueryValidator = Joi.object({
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    name: Joi.string().allow("").optional(),
  });

  // update PayRoll Months validation
  public UpdatePayrollMonthsValidator = Joi.object({
    month_id: Joi.number().min(1).max(12).optional(),
    days: Joi.number().min(1).max(31).optional(),
    hours: Joi.number().optional(),
  });

  //=================== Common Module validation ======================//

  // create Common validation
  public createCommonModuleValidator = Joi.object({
    name: Joi.string().allow("").required(),
    description: Joi.string().allow("").optional(),
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
    name: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //----------------------- Accomodation -------------------//
  public insertAccomodationValidator = Joi.object({
    check_in_time: Joi.string().required(),
    check_out_time: Joi.string().required(),
    child_age_policies: Joi.array()
      .items(
        Joi.object({
          age_from: Joi.number().required(),
          age_to: Joi.number().required(),
          charge_value: Joi.number().required(),
          charge_type: Joi.string()
            .allow("free", "fixed", "percentage", "same_as_adult")
            .required(),
        })
      )
      .optional(),
  });

  public updateAccomodationValidator = Joi.object({
    check_in_time: Joi.string().optional(),
    check_out_time: Joi.string().optional(),
    has_child_rates: Joi.boolean().optional(),
    add_child_age_policies: Joi.array()
      .items(
        Joi.object({
          age_from: Joi.number().required(),
          age_to: Joi.number().required(),
          charge_value: Joi.number().required(),
          charge_type: Joi.string()
            .allow("free", "fixed", "percentage", "same_as_adult")
            .required(),
        })
      )
      .optional(),
    remove_child_age_policies: Joi.array()
      .items(Joi.number().required())
      .optional(),
  });

  //----------------------- Cancellation  -------------------//

  public insertCancellationPolicyValidator = Joi.object({
    policy_name: Joi.string().required(),
    description: Joi.string().required(),
    rules: Joi.array()
      .items(
        Joi.object({
          days_before: Joi.number().required(),
          rule_type: Joi.string().allow("free", "charge", "no_show").required(),
          fee_type: Joi.string().allow("fixed", "percentage").optional(),
          fee_value: Joi.number().optional(),
        })
      )
      .required(),
  });

  public updateCancellationPolicyValidator = Joi.object({
    policy_name: Joi.string().optional(),
    description: Joi.string().optional(),
    // add_rules: Joi.array()
    //   .items(
    //     Joi.object({
    //       days_before: Joi.number().required(),
    //       rule_type: Joi.string().allow("free", "charge", "no_show").required(),
    //       fee_type: Joi.string().allow("fixed", "percentage").optional(),
    //       fee_value: Joi.number().optional(),
    //     })
    //   )
    //   .optional(),
    status: Joi.boolean().optional(),
    // remove_rules: Joi.array().items(Joi.number().required()).optional(),
  });

  // room rates
  public createRoomRateValidator = Joi.object({
    name: Joi.string().required(),
    cancellation_policy_id: Joi.number().integer().optional(),
    sources: Joi.array().items(Joi.number().integer().required()).optional(),
    meal_plan_items: Joi.array()
      .items(Joi.number().integer().required())
      .optional(),
    room_type_prices: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().integer().required(),
          base_rate: Joi.number().precision(2).min(0).required(),
        })
      )
      .required(),
  });

  public updateRoomRateValidator = Joi.object({
    name: Joi.string().required(),
    cancellation_policy_id: Joi.number().integer().required(),
    sources: Joi.array().items(Joi.number().integer().required()).optional(),
    meal_plan_items: Joi.array()
      .items(Joi.number().integer().required())
      .optional(),
    room_type_prices: Joi.array()
      .items(
        Joi.object({
          room_type_id: Joi.number().integer().required(),
          base_rate: Joi.number().precision(2).min(0).required(),
        })
      )
      .required(),
  });

  public roomBookingMealOption = Joi.object({
    is_possible_book_meal_opt_with_room: Joi.boolean().optional(),
    add_meal_items: Joi.array()
      .items(
        Joi.object({
          meal_plan_id: Joi.number().integer().required(),
          price: Joi.number().required(),
          vat: Joi.number().required(),
        })
      )
      .optional(),
    update_meal_items: Joi.array()
      .items(
        Joi.object({
          meal_plan_id: Joi.number().integer().required(),
          price: Joi.number().required(),
          vat: Joi.number().required(),
        })
      )
      .optional(),
    remove_meal_items: Joi.array().items(Joi.number().required()).optional(),
  });

  public updateRoomBookingMealOption = Joi.object({
    is_possible_book_meal_opt_with_room: Joi.string().optional(),
    add_meal_items: Joi.array()
      .items(
        Joi.object({
          meal_plan_id: Joi.number().integer().required(),
          price: Joi.number().required(),
          vat: Joi.number().required(),
        })
      )
      .optional(),

    remove_meal_items: Joi.array().items(Joi.number().required()).optional(),
  });

  //==================== Floor Setup validation ======================//

  public createFloorSetupValidator = Joi.object({
    floor_no: Joi.number().required(),
  });

  public updateFloorSetupValidator = Joi.object({
    floor_no: Joi.number().required(),
    status: Joi.boolean().optional(),
  });

  //==================== Building Setup validation ======================//
  public createBuildingSetupValidator = Joi.object({
    building_no: Joi.number().required(),
    description: Joi.string().optional(),
  });

  public updateBuildingSetupValidator = Joi.object({
    building_no: Joi.number().required(),
    description: Joi.string().allow("").optional(),
    status: Joi.boolean().optional(),
  });

  // --------------------- Payment gateway ---------------------//
  public createPaymentInfoSchema = Joi.object({
    type: Joi.string()
      .valid(...Object.values(PAYMENT_TYPE))
      .optional()
      .messages({
        "string.base": "Please enter valid type",
        "any.only": "Please enter valid type",
      }),
    title: Joi.string().required(),
    details: Joi.string().required().messages({
      "any.required": "Please enter valid details",
      "string.base": "Please enter valid details",
    }),

    is_default: Joi.boolean().required().messages({
      "any.required": "Please enter valid default value",
      "any.only": "Please enter valid default value",
    }),

    bank_charge: Joi.number().integer().optional().messages({
      "any.required": "Please enter valid bank charge",
      "number.base": "Please enter valid bank charge",
    }),

    bank_charge_type: Joi.string()
      .valid(PAYMENT_CHARGE_TYPE.FLAT, PAYMENT_CHARGE_TYPE.PERCENTAGE)
      .optional()
      .messages({
        "any.required": "Please enter valid bank charge type",
        "any.only": "Please enter valid bank charge type",
      }),
  });

  public updatePaymentInfoSchema = Joi.object({
    type: Joi.string()
      .valid(...Object.values(PAYMENT_TYPE))
      .optional()
      .messages({
        "string.base": "Please enter valid type",
        "any.only": "Please enter valid type",
      }),
    title: Joi.string().required(),

    details: Joi.string().optional().messages({
      "string.base": "Please enter valid details",
    }),

    is_default: Joi.string().valid("0", "1").optional().messages({
      "any.only": "Please enter valid default value",
    }),

    bank_charge: Joi.number().integer().optional().messages({
      "number.base": "Please enter valid bank charge",
    }),

    bank_charge_type: Joi.string()
      .valid(...Object.values(PAYMENT_CHARGE_TYPE))
      .optional()
      .messages({
        "any.only": "Please enter valid bank charge type",
      }),
  });
}
export default SettingValidator;
