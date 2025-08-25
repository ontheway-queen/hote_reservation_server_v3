import Joi from "joi";
class EmployeeValidator {
  createEmployeeValidator = Joi.object({
    name: Joi.string().allow("").required(),
    department_id: Joi.number().required(),
    designation_id: Joi.array().items(Joi.number()).required(),
    blood_group: Joi.number().optional(),
    salary: Joi.number().optional(),
    email: Joi.string().allow("").optional(),
    contact_no: Joi.string().allow("").required(),
    dob: Joi.string().optional(),
    appointment_date: Joi.string().optional(),
    joining_date: Joi.string().optional(),
    address: Joi.string().allow("").optional(),
  });

  getAllEmployeeQueryValidator = Joi.object({
    status: Joi.string().valid("0", "1"),
    category: Joi.string().allow("").optional(),
    key: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    department: Joi.string().allow("").optional(),
    designation: Joi.string().allow("").optional(),
  });

  updateEmployeeValidator = Joi.object({
    name: Joi.string().allow("").optional(),
    department_id: Joi.number().optional(),
    res_id: Joi.number().allow("").optional(),
    designation_id: Joi.number().optional(),
    blood_group: Joi.number().optional(),
    salary: Joi.number().optional(),
    status: Joi.boolean().optional(),
    mobile_no: Joi.string().allow("").optional(),
    dob: Joi.string().optional(),
    appointment_date: Joi.string().optional(),
    joining_date: Joi.string().optional(),
    address: Joi.string().allow("").optional(),
  });
}
export default EmployeeValidator;
