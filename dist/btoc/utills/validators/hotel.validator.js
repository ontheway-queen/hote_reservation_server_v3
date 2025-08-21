"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtoHotelValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class BtoHotelValidator {
    constructor() {
        this.hotelSearchValidator = joi_1.default.object({
            client_nationality: joi_1.default.string().required(),
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
            rooms: joi_1.default.array()
                .items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                children_ages: joi_1.default.array().items(joi_1.default.number()).required(),
            }))
                .required(),
        });
        this.recheckValidator = joi_1.default.object({
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
            room_type_id: joi_1.default.number().required(),
            rate_plan_id: joi_1.default.number().required(),
            rooms: joi_1.default.array()
                .items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                children_ages: joi_1.default.array().items(joi_1.default.number()).required(),
            }))
                .required(),
        });
        this.bookingValidator = joi_1.default.object({
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
            room_type_id: joi_1.default.number().required(),
            rate_plan_id: joi_1.default.number().required(),
            rooms: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                children_ages: joi_1.default.array().items(joi_1.default.number()).required(),
                paxes: joi_1.default.array().items(joi_1.default.object({
                    type: joi_1.default.string().valid("AD", "CH").required(),
                    title: joi_1.default.string()
                        .valid("Mr.", "Ms.", "Mrs.", "Mstr.")
                        .required(),
                    name: joi_1.default.string().required(),
                    surname: joi_1.default.string().required(),
                })),
            })), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
            special_requests: joi_1.default.string().allow(""),
            holder: joi_1.default.alternatives()
                .try(joi_1.default.object({
                title: joi_1.default.string().valid("Mr.", "Ms.", "Mrs.", "Mstr.").required(),
                first_name: joi_1.default.string().required(),
                last_name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                phone: joi_1.default.string().required(),
                address: joi_1.default.string().required(),
                client_nationlity: joi_1.default.string().allow("").optional(),
            }), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
        });
    }
}
exports.BtoHotelValidator = BtoHotelValidator;
//# sourceMappingURL=hotel.validator.js.map