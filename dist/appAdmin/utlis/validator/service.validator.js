"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ServiceValidator {
    constructor() {
        this.createServiceValidator = joi_1.default.object({
            services: joi_1.default.string()
                .custom((value, helpers) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch (_a) {
                    return helpers.message({
                        custom: "Invalid services, should be a valid JSON Object",
                    });
                }
                const requiredFields = [
                    "category_id",
                    "name",
                    "description",
                    "min_persons",
                    "max_persons",
                    "is_always_open",
                ];
                for (const field of requiredFields) {
                    if (parsed[field] === undefined || parsed[field] === null) {
                        return helpers.message({
                            custom: `services.${field} is required`,
                        });
                    }
                }
                return parsed;
            })
                .required(),
            service_pricing: joi_1.default.string()
                .custom((value, helpers) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                    console.log({ parsed });
                }
                catch (_a) {
                    console.log({
                        error: "Invalid service pricing, should be a valid JSON array",
                    });
                    return helpers.message({
                        custom: "Invalid service pricing, should be a valid JSON array",
                    });
                }
                if (!Array.isArray(parsed)) {
                    return helpers.message({
                        custom: "service_pricing must be an array of objects",
                    });
                }
                const requiredFields = [
                    "pricing_model",
                    "price",
                    "vat_percent",
                    "delivery_charge",
                    "delivery_types",
                    "delivery_time_estimate",
                    "discount_percent",
                ];
                for (let i = 0; i < parsed.length; i++) {
                    const item = parsed[i];
                    for (const field of requiredFields) {
                        if (item[field] === undefined || item[field] === null) {
                            return helpers.message({
                                custom: `service_pricing[${i}].${field} is required`,
                            });
                        }
                    }
                }
                return parsed;
            })
                .required(),
            service_schedule: joi_1.default.string().custom((value, helpers) => {
                let parsedSchedule;
                try {
                    parsedSchedule = JSON.parse(value);
                }
                catch (_a) {
                    return helpers.message({
                        custom: "Invalid service schedule, should be a valid JSON array",
                    });
                }
                if (!Array.isArray(parsedSchedule)) {
                    return helpers.message({
                        custom: "service_schedule must be an array of objects",
                    });
                }
                const requiredFields = ["day_of_week", "open_time", "close_time"];
                for (let i = 0; i < parsedSchedule.length; i++) {
                    const item = parsedSchedule[i];
                    for (const field of requiredFields) {
                        if (item[field] === undefined || item[field] === null) {
                            return helpers.message({
                                custom: `service_schedule[${i}].${field} is required`,
                            });
                        }
                    }
                }
                return parsedSchedule;
            }),
        });
        this.updateServiceValidator = joi_1.default.object({
            services: joi_1.default.string()
                .custom((value, helpers) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch (_a) {
                    return helpers.message({
                        custom: "Invalid services, should be a valid JSON Object",
                    });
                }
                const requiredFields = [
                    "category_id",
                    "name",
                    "description",
                    "min_persons",
                    "max_persons",
                    "is_always_open",
                    "delivery_required",
                ];
                const extraFields = Object.keys(parsed).filter((key) => !requiredFields.includes(key));
                if (extraFields && (extraFields === null || extraFields === void 0 ? void 0 : extraFields.length) > 0) {
                    for (const field of extraFields) {
                        return helpers.message({
                            custom: `services.${field} is not allowed`,
                        });
                    }
                }
                return parsed;
            })
                .optional(),
            delete_service_images_id: joi_1.default.string()
                .custom((value, helpers) => {
                if (!value)
                    return [];
                const parsed = JSON.parse(value);
                return parsed;
            })
                .optional(),
            service_pricing: joi_1.default.string()
                .custom((value, helpers) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                    console.log({ parsed });
                }
                catch (_a) {
                    console.log({
                        error: "Invalid service pricing, should be a valid JSON array",
                    });
                    return helpers.message({
                        custom: "Invalid service pricing, should be a valid JSON array",
                    });
                }
                if (!Array.isArray(parsed)) {
                    return helpers.message({
                        custom: "service_pricing must be an array of objects",
                    });
                }
                const requiredFields = [
                    "pricing_model",
                    "price",
                    "vat_percent",
                    "delivery_charge",
                    "delivery_types",
                    "delivery_time_estimate",
                    "peak_price",
                    "discount_percent",
                ];
                // for (let i = 0; i < parsed.length; i++) {
                // 	const item = parsed[i];
                // 	for (const field of requiredFields) {
                // 		if (item[field] === undefined || item[field] === null) {
                // 			return helpers.message({
                // 				custom: `service_pricing[${i}].${field} is required`,
                // 			});
                // 		}
                // 	}
                // }
                return parsed;
            })
                .optional(),
            delete_service_pricing_id: joi_1.default.string()
                .custom((value, helpers) => {
                if (!value)
                    return [];
                const parsed = JSON.parse(value);
                return parsed;
            })
                .optional(),
            service_schedule: joi_1.default.string().custom((value, helpers) => {
                let parsedSchedule;
                try {
                    parsedSchedule = JSON.parse(value);
                }
                catch (_a) {
                    return helpers.message({
                        custom: "Invalid service schedule, should be a valid JSON array",
                    });
                }
                return parsedSchedule;
            }),
            delete_service_schedule_id: joi_1.default.string()
                .custom((value, helpers) => {
                if (!value)
                    return [];
                const parsed = JSON.parse(value);
                return parsed;
            })
                .optional(),
        });
    }
}
exports.default = ServiceValidator;
//# sourceMappingURL=service.validator.js.map