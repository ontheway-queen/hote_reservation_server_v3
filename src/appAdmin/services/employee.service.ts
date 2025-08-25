import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import CustomError from "../../utils/lib/customEror";
import {
  IcreateEmployeeReqBody,
  IupdateEmployee,
} from "../utlis/interfaces/hr.interface";

export class EmployeeService extends AbstractServices {
  constructor() {
    super();
  }

  // create employee
  public async createEmployee(req: Request) {
    const { hotel_code, id } = req.hotel_admin;
    const body = req.body as IcreateEmployeeReqBody;

    return await this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        body["photo"] = files[0].filename;
      }

      const hrModel = this.Model.hrModel(trx);

      const { total } = await hrModel.getAllDepartment({
        ids: body.department_id,
        hotel_code,
      });

      if (total !== body.department_id.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Department not found from given id",
        };
      }
      const { data } = await hrModel.getAllEmployee({
        key: body.email,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Employee already exist",
        };
      }

      await hrModel.insertEmployee({
        ...req.body,
        hotel_code,
        created_by: id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // get all Employee
  public async getAllEmployee(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { key, department, designation } = req.query;

    const employeeModel = this.Model.employeeModel();

    const { data, total } = await employeeModel.getAllEmployee({
      key: key as string,
      hotel_code,
      department: department as string,
      designation: designation as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // get Single Employee
  public async getSingleEmployee(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.employeeModel().getSingleEmployee(
      parseInt(id),
      hotel_code
    );

    if (!data) {
      throw new CustomError(
        `The requested employee with ID: ${id} not found.`,
        this.StatusCode.HTTP_NOT_FOUND
      );
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // update employee
  public async updateEmployee(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { email, ...rest } = req.body as IupdateEmployee;

      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        rest["photo"] = files[0].filename;
      }

      const model = this.Model.employeeModel(trx);
      const res = await model.updateEmployee(parseInt(id), {
        ...rest,
        email,
      });

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Employee Profile updated successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Employee Profile didn't find from this ID",
        };
      }
    });
  }

  // Delete employee
  public async deleteEmployee(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.employeeModel(trx);
      const res = await model.deleteEmployee(parseInt(id));

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Employee Profile deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Employee Profile didn't find from this ID",
        };
      }
    });
  }

  // get Employees By Department Id
  public async getEmployeesByDepartmentId(req: Request) {
    const id = req.params.id;
    const { limit, skip } = req.query;
    const model = this.Model.employeeModel();

    const res = await model.getEmployeesByDepartmentId({
      id: Number(id),
      limit: Number(limit),
      skip: Number(skip),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      ...res,
    };
  }
}
export default EmployeeService;
