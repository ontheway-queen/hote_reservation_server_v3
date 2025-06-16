"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RoomValidator {
    constructor() {
        // create room validator
        this.createRoomValidator = joi_1.default.object({
            room_name: joi_1.default.string().required(),
            floor_no: joi_1.default.number().required(),
            room_type_id: joi_1.default.number().required(),
        });
        // get all hotel room validator
        this.getAllHotelRoomQueryValidator = joi_1.default.object({
            search: joi_1.default.string().allow("").optional(),
            room_type_id: joi_1.default.number().allow("").optional(),
            occupancy: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
        // update hotel room validator
        this.updateRoomValidator = joi_1.default.object({
            room_name: joi_1.default.string().optional(),
            floor_no: joi_1.default.number().optional(),
            room_type_id: joi_1.default.number().optional(),
        });
        this.updateRoomStatusValidator = joi_1.default.object({
            status: joi_1.default.string()
                .allow("in_service", "out_of_service", "clean", "dirty", "under_maintenance")
                .required(),
        });
    }
}
exports.default = RoomValidator;
//# sourceMappingURL=Room.validator.js.map