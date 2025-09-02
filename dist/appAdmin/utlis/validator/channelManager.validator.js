"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ChannelManagerValidator {
    constructor() {
        this.addChannelManager = joi_1.default.object({
            name: joi_1.default.string().required(),
            is_internal: joi_1.default.boolean().required(),
        });
        this.updateChannelManager = joi_1.default.object({
            name: joi_1.default.string().optional(),
            is_internal: joi_1.default.boolean().optional(),
        });
        this.channelAllocation = joi_1.default.object({
            room_type_id: joi_1.default.number().required(),
            channel_id: joi_1.default.number().required(),
            total_allocated_rooms: joi_1.default.number().required(),
            from_date: joi_1.default.string().required(),
            to_date: joi_1.default.string().required(),
            rate_plans: joi_1.default.array().items(joi_1.default.number().required()).required(),
        });
    }
}
exports.default = ChannelManagerValidator;
//# sourceMappingURL=channelManager.validator.js.map