"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdministrationValidator {
    constructor() {
        this.createRole = joi_1.default.object({
            role_name: joi_1.default.string().required(),
            permissions: joi_1.default.array()
                .items({
                permission_id: joi_1.default.number().required(),
                read: joi_1.default.number().valid(0, 1).required(),
                update: joi_1.default.number().valid(0, 1).required(),
                write: joi_1.default.number().valid(0, 1).required(),
                delete: joi_1.default.number().valid(0, 1).required(),
            })
                .required(),
        });
        //Permission validation
        this.createPermission = joi_1.default.object({
            permission_name: joi_1.default.string().min(1).max(255).required(),
            assign_permission: joi_1.default.bool().optional(),
        });
        //Update role permissions validator
        this.updateRolePermissions = joi_1.default.object({
            role_name: joi_1.default.string().optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
            update_permissions: joi_1.default.array()
                .items({
                h_permission_id: joi_1.default.number().required(),
                read: joi_1.default.number().valid(0, 1).required(),
                update: joi_1.default.number().valid(0, 1).required(),
                write: joi_1.default.number().valid(0, 1).required(),
                delete: joi_1.default.number().valid(0, 1).required(),
            })
                .optional(),
        });
        //create admin
        this.createAdmin = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().required(),
            password: joi_1.default.string().min(8).required(),
            phone: joi_1.default.string().allow("").optional(),
            role_id: joi_1.default.number().required(),
        });
        //get all admin query validator
        this.getAllAdminQueryValidator = joi_1.default.object({
            search: joi_1.default.string().allow(""),
            role_id: joi_1.default.number(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            status: joi_1.default.string(),
        });
        //update admin
        this.updateAdmin = joi_1.default.object({
            name: joi_1.default.string(),
            gender: joi_1.default.string().valid("Male", "Female", "Other"),
            phone: joi_1.default.string(),
            role_id: joi_1.default.number(),
            status: joi_1.default.boolean(),
        });
        //get users filter validator
        this.getUsersFilterValidator = joi_1.default.object({
            filter: joi_1.default.string(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        //update user profile
        this.editUserProfileValidator = joi_1.default.object({
            username: joi_1.default.string().min(1).max(255),
            first_name: joi_1.default.string().min(1).max(255),
            last_name: joi_1.default.string().min(1).max(255),
            gender: joi_1.default.string().valid("Male", "Female", "Other"),
            status: joi_1.default.boolean(),
        });
        //create city
        this.createCityValidator = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            name: joi_1.default.string().required(),
        });
    }
}
exports.default = AdministrationValidator;
//# sourceMappingURL=administration.validator.js.map