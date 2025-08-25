import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IUpdatePayrollMonths } from "../utlis/interfaces/setting.interface";
import SettingModel from "../../models/reservationPanel/Setting.Model";

class PayrollMonthsSettingService extends AbstractServices {
  constructor() {
    super();
  }

  //=================== Payroll Months service ======================//

  // create Payroll Months
  public async createPayrollMonths(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const { name, days, hours, month_id } = req.body;

      const model = this.Model.hrModel(trx);

      const { data } = await model.getPayrollMonths({
        month_id,
        hotel_code,
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Month name already exists, give another unique Month name",
        };
      }
      // model

      const res = await model.createPayrollMonths({
        hotel_code,
        month_id,
        days,
        hours: Math.round(hours),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Payroll Months created successfully.",
      };
    });
  }

  // Get all Payroll Months
  public async getAllPayrollMonths(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, name } = req.query;

    const model = this.Model.hrModel();

    const { data, total } = await model.getPayrollMonths({
      limit: limit as string,
      skip: skip as string,
      name: name as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // Update Payroll Months
  public async updatePayrollMonths(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const updatePayload = req.body as IUpdatePayrollMonths;

      const model = this.Model.hrModel(trx);
      const res = await model.updatePayrollMonths(parseInt(id), {
        month_id: updatePayload.month_id,
        days: updatePayload.days,
        hours: updatePayload.hours,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Month name updated successfully",
      };
    });
  }

  // Delete Payroll Months
  public async deletePayrollMonths(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.hrModel(trx);
      const res = await model.deletePayrollMonths(parseInt(id));

      if (res === 1) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Payroll Month deleted successfully",
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Payroll Month didn't find from this ID",
        };
      }
    });
  }
}
export default PayrollMonthsSettingService;
