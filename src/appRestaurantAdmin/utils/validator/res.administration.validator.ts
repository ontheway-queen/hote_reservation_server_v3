import Joi from "joi";

class ResAdministrationValidator {
  public createRole = Joi.object({
    role_name: Joi.string().required(),
    permissions: Joi.array()
      .items({
        res_permission_id: Joi.number().required(),
        read: Joi.number().valid(0, 1).required(),
        update: Joi.number().valid(0, 1).required(),
        write: Joi.number().valid(0, 1).required(),
        delete: Joi.number().valid(0, 1).required(),
      })
      .required(),
  });

  //Permission validation
  public createPermission = Joi.object({
    permission_name: Joi.string().min(1).max(255).required(),
    assign_permission: Joi.bool().optional(),
  });

  //Update role permissions validator
  public updateRolePermissions = Joi.object({
    role_name: Joi.string().optional(),
    status: Joi.boolean().optional(),
    update_permissions: Joi.array()
      .items({
        res_permission_id: Joi.number().required(),
        read: Joi.number().valid(0, 1).required(),
        update: Joi.number().valid(0, 1).required(),
        write: Joi.number().valid(0, 1).required(),
        delete: Joi.number().valid(0, 1).required(),
      })
      .optional(),
  });

  //create admin
  public createAdmin = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().allow("").optional(),
    role_id: Joi.number().required(),
  });

  //get all admin query validator
  public getAllAdminQueryValidator = Joi.object({
    search: Joi.string().allow(""),
    role_id: Joi.number(),
    limit: Joi.number(),
    skip: Joi.number(),
    status: Joi.string(),
  });

  //update admin
  public updateAdmin = Joi.object({
    name: Joi.string(),
    gender: Joi.string().valid("Male", "Female", "Other"),
    phone: Joi.string(),
    role_id: Joi.number(),
    status: Joi.boolean(),
  });

  //get users filter validator
  public getUsersFilterValidator = Joi.object({
    filter: Joi.string(),
    status: Joi.boolean(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  //update user profile
  public editUserProfileValidator = Joi.object({
    username: Joi.string().min(1).max(255),
    first_name: Joi.string().min(1).max(255),
    last_name: Joi.string().min(1).max(255),
    gender: Joi.string().valid("Male", "Female", "Other"),
    status: Joi.boolean(),
  });

  //create city
  public createCityValidator = Joi.object({
    country_id: Joi.number().required(),
    name: Joi.string().required(),
  });
}

export default ResAdministrationValidator;
