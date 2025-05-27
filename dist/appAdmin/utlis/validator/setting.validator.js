"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class SettingValidator {
    constructor() {
        // create room Type validation
        this.createRoomTypeValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            categories_type_id: joi_1.default.number().required(),
            area: joi_1.default.number().required(),
            room_info: joi_1.default.string().required(),
            rt_amenities: joi_1.default.string().required(),
            beds: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.object({
                bed_type_id: joi_1.default.number().required(),
                quantity: joi_1.default.number().min(1).required(),
            })), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                        return helpers.error("any.invalid");
                    for (const item of parsed) {
                        if (typeof item !== "object" ||
                            typeof item.bed_type_id !== "number" ||
                            typeof item.quantity !== "number" ||
                            item.quantity < 1) {
                            return helpers.error("any.invalid");
                        }
                    }
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
        });
        // create room Type Categories  validation
        this.createRoomTypeCategoriesValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        // get all room Type query validator
        this.getAllRoomTypeQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            search: joi_1.default.string().allow("").optional(),
            is_active: joi_1.default.boolean().optional(),
        });
        // update room type validation
        this.updateRoomTypeValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            description: joi_1.default.string().optional(),
            categories_type_id: joi_1.default.number().optional(),
            base_occupancy: joi_1.default.number().optional(),
            max_occupancy: joi_1.default.number().optional(),
            max_adults: joi_1.default.number().optional(),
            max_children: joi_1.default.number().optional(),
            bed_count: joi_1.default.number().optional(),
            area: joi_1.default.number().optional(),
            room_info: joi_1.default.string().optional(),
            rt_amenities: joi_1.default.string().optional(),
            beds: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.object({
                bed_type_id: joi_1.default.number().required(),
                quantity: joi_1.default.number().min(1).required(),
            })), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                        return helpers.error("any.invalid");
                    for (const item of parsed) {
                        if (typeof item !== "object" ||
                            typeof item.bed_type_id !== "number" ||
                            typeof item.quantity !== "number" ||
                            item.quantity < 1) {
                            return helpers.error("any.invalid");
                        }
                    }
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            remove_beds: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().required()), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        return helpers.error("any.invalid");
                    }
                    if (parsed.some((item) => typeof item !== "number" || isNaN(item))) {
                        return helpers.error("any.invalid");
                    }
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            remove_photos: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().required()), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        return helpers.error("any.invalid");
                    }
                    if (parsed.some((item) => typeof item !== "number" || isNaN(item))) {
                        return helpers.error("any.invalid");
                    }
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
        });
        // update room type Categories validation
        this.UpdateRoomTypeCategoriesValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            is_active: joi_1.default.boolean().optional(),
        });
        //=================== Bed Type validation ======================//
        // create bed Type validation
        this.createBedTypeValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            width: joi_1.default.number().optional(),
            height: joi_1.default.number().optional(),
            unit: joi_1.default.string().optional(),
        });
        // get all Bed Type query validator
        this.getAllBedTypeQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            bed_type: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update bed type validation
        this.UpdateBedTypeValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            width: joi_1.default.number().allow("").optional(),
            height: joi_1.default.number().allow("").optional(),
            unit: joi_1.default.string().allow("").optional(),
            status: joi_1.default.boolean().optional(),
        });
        //=================== Bank Name validation ======================//
        // create Bank Name
        this.createBankNameValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
        });
        // get all Bank Name
        this.getAllBankNameQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
        });
        // update Bank Name
        this.UpdateBankNameValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //=================== designation validation ======================//
        // create designation validation
        this.createdesignationValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
        });
        // get all designation query validation
        this.getAlldesignationQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update designation validation
        this.UpdatedesignationValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //=================== department validation ======================//
        // create department validation
        this.createdepartmentValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
        });
        // get all department query validation
        this.getAlldepartmentQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update department validation
        this.UpdatedepatmentValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //=================== Hall Amenities validation ======================//
        // create Hall Amenities validation
        this.createHallAmenitiesValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
            description: joi_1.default.string().allow("").optional(),
        });
        // get all Hall Amenities query validator
        this.getAllHallAmenitiesQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update Hall Amenities validation
        this.UpdateHallAmenitiesValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            description: joi_1.default.string().allow("").optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //=================== PayRoll Months validation ======================//
        // create PayRoll Months validation
        this.createPayRollMonthsValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
            days: joi_1.default.number().optional(),
            hours: joi_1.default.number().allow("").required(),
        });
        // get all PayRoll Months query validation
        this.getAllPayrollMonthsQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
        });
        // update PayRoll Months validation
        this.UpdatePayrollMonthsValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            days: joi_1.default.number().optional(),
            hours: joi_1.default.number().allow("").optional(),
        });
        //=================== Common Module validation ======================//
        // create Common validation
        this.createCommonModuleValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
            description: joi_1.default.string().allow("").optional(),
        });
        // get all Common query validator
        this.getAllCommonModuleQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update Common validation
        this.UpdateCommonModuleValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            description: joi_1.default.string().allow("").optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //----------------------- Accomodation -------------------//
        this.insertAccomodationValidator = joi_1.default.object({
            check_in_time: joi_1.default.string().required(),
            check_out_time: joi_1.default.string().required(),
            child_age_policies: joi_1.default.array()
                .items(joi_1.default.object({
                age_from: joi_1.default.number().required(),
                age_to: joi_1.default.number().required(),
                charge_value: joi_1.default.number().required(),
                charge_type: joi_1.default.string()
                    .allow("free", "fixed", "percentage", "same_as_adult")
                    .required(),
            }))
                .optional(),
        });
        this.updateAccomodationValidator = joi_1.default.object({
            check_in_time: joi_1.default.string().optional(),
            check_out_time: joi_1.default.string().optional(),
            has_child_rates: joi_1.default.boolean().optional(),
            add_child_age_policies: joi_1.default.array()
                .items(joi_1.default.object({
                age_from: joi_1.default.number().required(),
                age_to: joi_1.default.number().required(),
                charge_value: joi_1.default.number().required(),
                charge_type: joi_1.default.string()
                    .allow("free", "fixed", "percentage", "same_as_adult")
                    .required(),
            }))
                .optional(),
            remove_child_age_policies: joi_1.default.array()
                .items(joi_1.default.number().required())
                .optional(),
        });
        //----------------------- Cancellation  -------------------//
        this.insertCancellationPolicyValidator = joi_1.default.object({
            policy_name: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            rules: joi_1.default.array()
                .items(joi_1.default.object({
                days_before: joi_1.default.number().required(),
                rule_type: joi_1.default.string().allow("free", "charge", "no_show").required(),
                fee_type: joi_1.default.string().allow("fixed", "percentage").optional(),
                fee_value: joi_1.default.number().optional(),
            }))
                .required(),
        });
        this.updateCancellationPolicyValidator = joi_1.default.object({
            policy_name: joi_1.default.string().optional(),
            description: joi_1.default.string().optional(),
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
            status: joi_1.default.boolean().optional(),
            // remove_rules: Joi.array().items(Joi.number().required()).optional(),
        });
        // room rates
        this.createRoomRateValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            cancellation_policy_id: joi_1.default.number().integer().required(),
            sources: joi_1.default.array().items(joi_1.default.number().integer().required()).optional(),
            meal_plan_items: joi_1.default.array()
                .items(joi_1.default.number().integer().required())
                .optional(),
            room_type_prices: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().integer().required(),
                base_rate: joi_1.default.number().precision(2).min(0).required(),
                extra_adult_rate: joi_1.default.number()
                    .default(0)
                    .precision(2)
                    .min(0)
                    .optional(),
                extra_child_rate: joi_1.default.number()
                    .default(0)
                    .precision(2)
                    .min(0)
                    .optional(),
                child_rate_groups: joi_1.default.array()
                    .items(joi_1.default.object({
                    age_from: joi_1.default.number().integer().min(0).required(),
                    age_to: joi_1.default.number()
                        .integer()
                        .min(joi_1.default.ref("age_from"))
                        .required(),
                    rate_type: joi_1.default.string()
                        .valid("fixed", "percentage", "free")
                        .required(),
                    rate_value: joi_1.default.number().precision(2).min(0).required(),
                }))
                    .optional(),
                specific_dates: joi_1.default.array()
                    .items(joi_1.default.object({
                    date: joi_1.default.array().items(joi_1.default.string()).required(),
                    type: joi_1.default.string()
                        .valid("for_all_specific_day", "specific_day")
                        .required(),
                    rate: joi_1.default.number().precision(2).min(0).required(),
                    extra_adult_rate: joi_1.default.number()
                        .precision(2)
                        .min(0)
                        .optional()
                        .default(0),
                    extra_child_rate: joi_1.default.number()
                        .precision(2)
                        .min(0)
                        .optional()
                        .default(0),
                }))
                    .optional(),
            }))
                .required(),
        });
        this.updateRoomRateValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            cancellation_policy_id: joi_1.default.number().integer().required(),
            sources: joi_1.default.array().items(joi_1.default.number().integer().required()).optional(),
            meal_plan_items: joi_1.default.array()
                .items(joi_1.default.number().integer().required())
                .optional(),
            room_type_prices: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().integer().required(),
                base_rate: joi_1.default.number().precision(2).min(0).required(),
                extra_adult_rate: joi_1.default.number().precision(2).min(0).required(),
                extra_child_rate: joi_1.default.number().precision(2).min(0).required(),
                child_rate_groups: joi_1.default.array()
                    .items(joi_1.default.object({
                    age_from: joi_1.default.number().integer().min(0).required(),
                    age_to: joi_1.default.number()
                        .integer()
                        .min(joi_1.default.ref("age_from"))
                        .required(),
                    rate_type: joi_1.default.string()
                        .valid("fixed", "percentage", "free")
                        .required(),
                    rate_value: joi_1.default.number().precision(2).min(0).required(),
                }))
                    .optional(),
                specific_dates: joi_1.default.array()
                    .items(joi_1.default.object({
                    date: joi_1.default.array().items(joi_1.default.string()).required(),
                    type: joi_1.default.string()
                        .valid("for_all_specific_day", "specific_day")
                        .required(),
                    rate: joi_1.default.number().precision(2).min(0).required(),
                    extra_adult_rate: joi_1.default.number().precision(2).min(0).optional(),
                    extra_child_rate: joi_1.default.number().precision(2).min(0).optional(),
                }))
                    .optional(),
            }))
                .required(),
        });
        this.roomBookingMealOption = joi_1.default.object({
            is_possible_book_meal_opt_with_room: joi_1.default.boolean().optional(),
            add_meal_items: joi_1.default.array()
                .items(joi_1.default.object({
                meal_plan_id: joi_1.default.number().integer().required(),
                price: joi_1.default.number().required(),
                vat: joi_1.default.number().required(),
            }))
                .optional(),
            update_meal_items: joi_1.default.array()
                .items(joi_1.default.object({
                meal_plan_id: joi_1.default.number().integer().required(),
                price: joi_1.default.number().required(),
                vat: joi_1.default.number().required(),
            }))
                .optional(),
            remove_meal_items: joi_1.default.array().items(joi_1.default.number().required()).optional(),
        });
        this.updateRoomBookingMealOption = joi_1.default.object({
            is_possible_book_meal_opt_with_room: joi_1.default.string().optional(),
            add_meal_items: joi_1.default.array()
                .items(joi_1.default.object({
                meal_plan_id: joi_1.default.number().integer().required(),
                price: joi_1.default.number().required(),
                vat: joi_1.default.number().required(),
            }))
                .optional(),
            remove_meal_items: joi_1.default.array().items(joi_1.default.number().required()).optional(),
        });
    }
}
exports.default = SettingValidator;
//# sourceMappingURL=setting.validator.js.map