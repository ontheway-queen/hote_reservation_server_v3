"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RoomValidator {
    constructor() {
        this.createRoomValidator = joi_1.default.object({
            room_name: joi_1.default.string().required(),
            floor_no: joi_1.default.number().required(),
            room_type_id: joi_1.default.number().required(),
        });
        this.createMultipleRoomValidator = joi_1.default.object({
            from_room: joi_1.default.string().required(),
            to_room: joi_1.default.string().required(),
            floor_no: joi_1.default.number().required(),
            room_type_id: joi_1.default.number().required(),
        })
            .custom((value, helpers) => {
            const from = parseInt(value.from_room, 10);
            const to = parseInt(value.to_room, 10);
            if (isNaN(from) || isNaN(to)) {
                return helpers.error("any.invalid_from_to_room");
            }
            if (from < 0 || to < 0) {
                return helpers.error("any.negative_room_numbers");
            }
            if (to <= from) {
                return helpers.error("any.to_less_than_from");
            }
            return value;
        })
            .messages({
            "any.invalid_from_to_room": `"from_room" and "to_room" must be valid numbers`,
            "any.to_less_than_from": `"to_room" must be greater than "from_room"`,
            "any.negative_room_numbers": `"from_room" and "to_room" must be greater than or equal to 0`,
        });
        this.getAllHotelRoomQueryValidator = joi_1.default.object({
            search: joi_1.default.string().allow("").optional(),
            room_type_id: joi_1.default.number().allow("").optional(),
            occupancy: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
        this.getAllHotelRoomByRoomStatusQueryValidator = joi_1.default.object({
            room_type_id: joi_1.default.number().allow("").optional(),
            current_date: joi_1.default.string().required(),
            status: joi_1.default.string().allow("").optional(),
        });
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
        this.getAllOccupiedRoomsQueryValidator = joi_1.default.object({
            date: joi_1.default.string().required(),
        });
    }
}
exports.default = RoomValidator;
//# sourceMappingURL=Room.validator.js.map