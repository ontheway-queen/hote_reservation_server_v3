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
                children_ages: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .required(),
        });
    }
}
exports.BtoHotelValidator = BtoHotelValidator;
//# sourceMappingURL=hotel.validator.js.map