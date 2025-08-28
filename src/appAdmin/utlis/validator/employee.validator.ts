import Joi from "joi";
class EmployeeValidator {
  createEmployeeValidator = Joi.object({
    name: Joi.string().allow("").required(),
    department_ids: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          let ids;
          if (value.startsWith("[") && value.endsWith("]")) {
            ids = JSON.parse(value);
          }
          ids = ids.map((id: any) => Number(id));

          if (ids.some(isNaN)) {
            return helpers.error("any.invalid");
          }

          console.log(ids);

          return ids;
        } catch (err) {
          return helpers.error("any.invalid");
        }
      }),

    designation_id: Joi.string().required(),
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
    status: Joi.boolean().optional(),
    key: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    department_id: Joi.string().allow("").optional(),
    designation_id: Joi.string().allow("").optional(),
  });

  updateEmployeeValidator = Joi.object({
    name: Joi.string().allow("").optional(),
    new_department_ids: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          let ids;
          if (value.startsWith("[") && value.endsWith("]")) {
            ids = JSON.parse(value);
          }
          ids = ids.map((id: any) => Number(id));

          if (ids.some(isNaN)) {
            return helpers.error("any.invalid");
          }

          console.log(ids);

          return ids;
        } catch (err) {
          return helpers.error("any.invalid");
        }
      }),

    remove_department_ids: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          let ids;
          if (value.startsWith("[") && value.endsWith("]")) {
            ids = JSON.parse(value);
          }
          ids = ids.map((id: any) => Number(id));

          if (ids.some(isNaN)) {
            return helpers.error("any.invalid");
          }

          console.log(ids);

          return ids;
        } catch (err) {
          return helpers.error("any.invalid");
        }
      }),
    designation_id: Joi.number().optional(),
    blood_group: Joi.number().optional(),
    salary: Joi.number().optional(),
    status: Joi.boolean().optional(),
    contact_no: Joi.string().allow("").optional(),
    dob: Joi.string().optional(),
    appointment_date: Joi.string().optional(),
    joining_date: Joi.string().optional(),
    address: Joi.string().allow("").optional(),
  });
}
export default EmployeeValidator;
