"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class MConfigurationValidator {
    constructor() {
        // create permission group validator
        this.createPermissionGroupValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        // create permission validator
        this.createPermissionValidator = joi_1.default.object({
            permission_group_id: joi_1.default.number().required(),
            name: joi_1.default.array().items(joi_1.default.string()).required(),
        });
        // update permission validator
        this.updatePermissionValidator = joi_1.default.object({
            added: joi_1.default.array().items(joi_1.default.number().required()).optional(),
            deleted: joi_1.default.array().items(joi_1.default.number().required()).optional(),
        });
        // Define Joi schema for permissions
        this.permissionSchema = joi_1.default.object({
            permission_id: joi_1.default.number().required(),
            permission_type: joi_1.default.string()
                .valid("read", "write", "update", "delete")
                .required(),
        });
        // Define Joi schema for the entire object
        this.createRolePermissionValidator = joi_1.default.object({
            role_name: joi_1.default.string().required(),
            permissions: joi_1.default.array().items(this.permissionSchema).min(1).required(),
        });
        this.insertCityValidator = joi_1.default.object({
            city_name: joi_1.default.string().required(),
            country_code: joi_1.default.string().required().length(2),
        });
        this.getAllAdminQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.string().valid("active", "blocked").optional(),
        });
        //=================== Room type Amenities validation ======================//
        this.createRoomTypeAmenitiesHeadValidator = joi_1.default.object({
            name: joi_1.default.string().allow().required(),
        });
        this.UpdateRoomTypeAmenitiesHeadValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.bool().optional(),
        });
        this.createRoomTypeAmenitiesValidator = joi_1.default.object({
            name: joi_1.default.string().allow().required(),
            rtahead_id: joi_1.default.number().required(),
        });
        this.getAllRoomTypeAmenitiesQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            search: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        this.UpdateRoomTypeAmenitiesValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.bool().optional(),
            rtahead_id: joi_1.default.number().optional(),
        });
    }
}
exports.default = MConfigurationValidator;
//# sourceMappingURL=mConfiguration.validator.js.map