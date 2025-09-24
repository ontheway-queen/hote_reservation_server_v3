import {
  IpayrollRequestBody,
  IpayrollUpdateRequestBody,
  IUpdatePayrollBody,
} from "./../utlis/interfaces/payRoll.interface";
import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import CustomError from "../../utils/lib/customEror";
import { HelperFunction } from "../utlis/library/helperFunction";

class PayRollService extends AbstractServices {
  constructor() {
    super();
  }

  public async createPayRoll(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const {
        deductions = [],
        allowances = [],
        account_id,
        total_days,
        granted_leave_days,
        total_attendance_days,
        basic_salary,
        employee_id,
        payroll_month,
        salary_date,
        note,
      } = req.body as IpayrollRequestBody;

      (req.files as Express.Multer.File[] | undefined)?.forEach(
        ({ fieldname, filename }) => (req.body[fieldname] = filename)
      );

      const employeeModel = this.Model.employeeModel(trx);
      const model = this.Model.payRollModel(trx);
      const accountModel = this.Model.accountModel(trx);
      const hotelModel = this.Model.HotelModel(trx);

      /** ---------------- Validate Employee & Payroll ---------------- */
      const employee = await employeeModel.getSingleEmployee(
        employee_id,
        hotel_code
      );
      if (!employee) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Employee not found",
        };
      }

      const hasPayroll = await model.hasPayrollForMonth({
        employee_id: employee.id,
        hotel_code,
        payroll_month,
      });
      if (hasPayroll) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.HTTP_CONFLICT,
        };
      }

      /** ---------------- Validate Account ---------------- */
      const account = await accountModel.getSingleAccount({
        hotel_code,
        id: account_id,
      });
      if (!account.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      /** ---------------- Salary Calculations ---------------- */
      const daily_rate = Number(basic_salary) / total_days;
      const unpaid_leave_days = total_days - granted_leave_days;
      const payable_days = total_attendance_days + granted_leave_days;
      const payable_basic = daily_rate * payable_days;
      const unpaid_leave_deduction = daily_rate * unpaid_leave_days;

      let total_deduction = 0;
      let total_allowance = 0;

      const deductionsPayload = deductions.map((d) => {
        const amount = Number(d.deduction_amount);
        total_deduction += amount;
        return {
          employee_id: employee.id,
          deduction_name: d.deduction_name,
          deduction_amount: amount,
        };
      });

      const allowancesPayload = allowances.map((a) => {
        const amount = Number(a.allowance_amount);
        total_allowance += amount;
        return {
          employee_id,
          allowance_name: a.allowance_name,
          allowance_amount: amount,
        };
      });

      const gross_salary = payable_basic + total_allowance;
      const net_salary = gross_salary - total_deduction;

      /** ---------------- Payroll Insert ---------------- */
      const payload = {
        employee_id,
        account_id,
        payment_method: account[0].acc_type,
        basic_salary,
        payable_basic,
        net_salary,
        gross_salary,
        unpaid_leave_deduction,
        docs: req.body.docs,
        leave_days: total_days - total_attendance_days,
        unpaid_leave_days,
        note,
        total_days,
        payable_days,
        daily_rate,
        salary_date,
        created_by: admin_id,
        hotel_code,
        granted_leave_days,
        payroll_month,
        total_attendance_days,
      };

      const [{ id: payroll_id }] = await model.CreatePayRoll(payload);

      if (deductionsPayload.length) {
        await model.createEmployeeDeductions(
          deductionsPayload.map((d) => ({ ...d, payroll_id }))
        );
      }
      if (allowancesPayload.length) {
        await model.createEmployeeAllowances(
          allowancesPayload.map((a) => ({ ...a, payroll_id }))
        );
      }

      /** ---------------- Accounting ---------------- */
      const helper = new HelperFunction();
      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "PAYROLL_HEAD_ID",
      ]);

      const payroll_head = heads.find((h) => h.config === "PAYROLL_HEAD_ID");
      if (!payroll_head) {
        throw new Error("PAYROLL_HEAD_ID not configured for this hotel");
      }

      const today = new Date().toISOString();

      // Debit expense
      await accountModel.insertAccVoucher([
        {
          acc_head_id: payroll_head.head_id,
          created_by: admin_id,
          debit: net_salary,
          credit: 0,
          description: `Expense for payroll`,
          voucher_date: today,
          voucher_no: await helper.generateVoucherNo("JV", trx),
          hotel_code,
        },
      ]);

      // Credit account
      const voucher_type: "CCV" | "BCV" =
        account[0].acc_type === "BANK" ? "BCV" : "CCV";
      await accountModel.insertAccVoucher([
        {
          acc_head_id: account[0].acc_head_id,
          created_by: admin_id,
          debit: 0,
          credit: net_salary,
          description: `Expense for payroll`,
          voucher_date: today,
          voucher_no: await helper.generateVoucherNo(voucher_type, trx),
          hotel_code,
        },
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Payroll created successfully.",
      };
    });
  }

  public async getAllPayRoll(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, key, from_date, to_date } = req.query;

    const { data, total } = await this.Model.payRollModel().getAllPayRoll({
      limit: limit as string,
      skip: skip as string,
      key: key as string,
      from_date: from_date as string,
      to_date: to_date as string,
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSinglePayRoll(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.payRollModel().getSinglePayRoll(
      parseInt(id),
      hotel_code
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: `The requested payroll with ID: ${id} not found.`,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data,
    };
  }

  public async updatePayRoll(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { hotel_code, id: admin_id } = req.hotel_admin;
      const {
        add_deductions = [],
        delete_deductions = [],
        add_allowances = [],
        delete_allowances = [],
        allowances = [],
        deductions = [],
        account_id,
        basic_salary,
        employee_id,
        total_days,
        granted_leave_days,
        total_attendance_days,
        payroll_month,
        ...rest
      } = req.body as IpayrollUpdateRequestBody;

      // Attach file names if uploaded
      (req.files as Express.Multer.File[] | undefined)?.forEach(
        ({ fieldname, filename }) => (req.body[fieldname] = filename)
      );

      const employeeModel = this.Model.employeeModel(trx);
      const model = this.Model.payRollModel(trx);
      const accountModel = this.Model.accountModel(trx);

      const existingPayroll = await model.getSinglePayRoll(
        Number(id),
        hotel_code
      );
      if (!existingPayroll) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Payroll not found",
        };
      }

      const employee = await employeeModel.getSingleEmployee(
        existingPayroll.employee_id,
        hotel_code
      );
      if (!employee) {
        throw new CustomError(
          "Employee not found!",
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const account = await accountModel.getSingleAccount({
        hotel_code,
        id: account_id,
      });
      if (!account.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      /** ---------------- Salary Calculations ---------------- */
      const daily_rate = Number(basic_salary) / total_days;
      const unpaid_leave_days = total_days - granted_leave_days;
      const payable_days = total_attendance_days + granted_leave_days;
      const payable_basic = daily_rate * payable_days;
      const unpaid_leave_deduction = daily_rate * unpaid_leave_days;

      let totalDeductionsAmount = 0;
      let totalAllowancesAmount = 0;

      /** ---------------- Update Existing Allowances ---------------- */
      if (allowances.length) {
        totalAllowancesAmount += allowances.reduce(
          (sum, a) => sum + Number(a.allowance_amount),
          0
        );
        await Promise.all(
          allowances.map(({ id, ...payload }) =>
            model.updateEmployeeAllowances({ id, payload })
          )
        );
      }

      /** ---------------- Update Existing Deductions ---------------- */
      if (deductions.length) {
        totalDeductionsAmount += deductions.reduce(
          (sum, d) => sum + Number(d.deduction_amount),
          0
        );
        await Promise.all(
          deductions.map(({ id, ...payload }) =>
            model.updateEmployeeDeductions({ id, payload })
          )
        );
      }

      /** ---------------- Add/Delete Deductions ---------------- */
      if (add_deductions.length) {
        const deductionsPayload = add_deductions.map((d) => {
          const amount = Number(d.deduction_amount);
          totalDeductionsAmount += amount;
          return {
            payroll_id: Number(id),
            employee_id,
            ...d,
            deduction_amount: amount,
          };
        });
        await model.createEmployeeDeductions(deductionsPayload);
      }
      if (delete_deductions.length) {
        await model.deleteEmployeeDeductionsByIds({
          payroll_id: Number(id),
          ids: delete_deductions,
        });
      }

      /** ---------------- Add/Delete Allowances ---------------- */
      if (add_allowances.length) {
        const allowancesPayload = add_allowances.map((a) => {
          const amount = Number(a.allowance_amount);
          totalAllowancesAmount += amount;
          return {
            payroll_id: Number(id),
            employee_id,
            ...a,
            allowance_amount: amount,
          };
        });
        await model.createEmployeeAllowances(allowancesPayload);
      }
      if (delete_allowances.length) {
        await model.deleteEmployeeAllowancesByIds({
          payroll_id: Number(id),
          ids: delete_allowances,
        });
      }

      /** ---------------- Final Salary Calculation ---------------- */
      const gross_salary = payable_basic + totalAllowancesAmount;
      const net_salary = gross_salary - totalDeductionsAmount;

      const payload: IUpdatePayrollBody = {
        ...rest,
        payment_method: account[0].acc_type,
        basic_salary,
        employee_id,
        payable_days,
        daily_rate,
        total_days,
        leave_days: total_days - total_attendance_days,
        unpaid_leave_deduction,
        account_id,
        gross_salary,
        net_salary,
        updated_by: admin_id,
        hotel_code,
        payroll_month,
        granted_leave_days,
        total_attendance_days,
      };

      await model.updatePayRoll({ id: Number(id), payload });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Payroll updated successfully.",
      };
    });
  }

  public async deletePayRoll(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { hotel_code, id: admin_id } = req.hotel_admin;

      const model = this.Model.payRollModel(trx);

      const existingPayroll = await model.getSinglePayRoll(
        parseInt(id),
        hotel_code
      );
      if (!existingPayroll) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Payroll not found",
        };
      }

      await model.deletePayRoll({
        id: parseInt(id),
        payload: {
          is_deleted: true,
          deleted_by: admin_id,
          deleted_at: new Date().toISOString(),
        },
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Payroll deleted successfully",
      };
    });
  }
}
export default PayRollService;
