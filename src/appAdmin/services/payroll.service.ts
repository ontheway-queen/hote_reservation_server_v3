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
      const { hotel_code, id } = req.hotel_admin;
      const {
        deductions,
        allowances,
        account_id,
        total_days,
        gurranted_leave_days,
        basic_salary,
        employee_id,
        ...rest
      } = req.body as IpayrollRequestBody;

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length) {
        for (const { fieldname, filename } of files) {
          req.body[fieldname] = filename;
        }
      }

      const employeeModel = this.Model.employeeModel(trx);
      const model = this.Model.payRollModel(trx);
      const accountModel = this.Model.accountModel(trx);

      const isEmployeeExists = await employeeModel.getSingleEmployee(
        employee_id,
        hotel_code
      );

      if (!isEmployeeExists) {
        throw new CustomError(
          "Employee with the related id not found!",
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      console.log({ isEmployeeExists });
      const isPayrollExistsForMonth = await model.hasPayrollForMonth({
        employee_id: isEmployeeExists.id,
        hotel_code,
        payroll_month: rest.payroll_month,
      });
      if (isPayrollExistsForMonth) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.HTTP_CONFLICT,
        };
      }

      // Check account
      const checkAccount = await accountModel.getSingleAccount({
        hotel_code,
        id: account_id,
      });

      if (!checkAccount.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      const daily_rate = Number(basic_salary) / total_days;

      const unpaid_leave_days = total_days - gurranted_leave_days;

      const payable_days = total_days - unpaid_leave_days;

      const total_unpaid_leave_deduction_amount =
        daily_rate * unpaid_leave_days;

      const payable_basic = daily_rate * payable_days;

      let totalDeductionsAmount = 0;
      let totalAllowancesAmount = 0;
      let deductionsPayload: any[] = [];

      if (deductions.length)
        deductionsPayload = deductions.map((deduction) => {
          const amount = Number(deduction.deduction_amount);
          totalDeductionsAmount = totalDeductionsAmount + amount;
          return {
            employee_id: isEmployeeExists.id,
            deduction_name: deduction.deduction_name,
            deduction_amount: amount,
          };
        });

      //  Handle Allowances
      let allowancesPayload: any[] = [];

      allowancesPayload = allowances.map((allowance) => {
        const amount = Number(allowance.allowance_amount);
        totalAllowancesAmount = totalAllowancesAmount + amount;

        return {
          employee_id,
          allowance_name: allowance.allowance_name,
          allowance_amount: amount,
        };
      });

      const gross_salary = payable_basic + totalAllowancesAmount;

      const netSalary = gross_salary - totalDeductionsAmount || 0;

      console.log({ id });
      const payload = {
        employee_id,
        account_id,
        payment_method: checkAccount[0].acc_type,
        basic_salary,
        payable_basic,
        total_allowance: totalAllowancesAmount,
        total_deduction: totalDeductionsAmount,
        net_salary: netSalary,
        gross_salary,
        unpaid_leave_deduction: total_unpaid_leave_deduction_amount,
        docs: req.body.docs,
        leave_days: rest.leave_days,
        unpaid_leave_days,
        note: rest.note,
        total_days,
        payable_days,
        daily_rate,
        salary_date: rest.salary_date,
        created_by: id,
        hotel_code,
        gurranted_leave_days,
        payroll_month: rest.payroll_month,
      };

      const res = await model.CreatePayRoll(payload);
      const payroll_id = res[0]?.id;

      console.log({ payroll_id });
      console.log({ deductionsPayload, deductions });
      if (deductionsPayload.length) {
        const deductionsWithPayrollId = deductionsPayload.map((d) => ({
          ...d,
          payroll_id,
        }));
        await model.createEmployeeDeductions(deductionsWithPayrollId);
      }

      if (allowancesPayload.length) {
        const allowancesWithPayrollId = allowancesPayload.map((a) => ({
          ...a,
          payroll_id,
        }));
        await model.createEmployeeAllowances(allowancesWithPayrollId);
      }

      // _____________________ Accounting __________________________//

      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "PAYROLL_HEAD_ID",
      ]);

      const payroll_head = heads.find((h) => h.config === "PAYROLL_HEAD_ID");

      if (!payroll_head) {
        throw new Error("PAYROLL_HEAD_ID not configured for this hotel");
      }

      const voucher_no1 = await helper.generateVoucherNo("JV", trx);

      const today = new Date().toISOString();
      console.log({ payroll_head });
      await accountModel.insertAccVoucher([
        {
          acc_head_id: payroll_head.head_id,
          created_by: id,
          debit: netSalary,
          credit: 0,
          description: `Expense for payroll`,
          voucher_date: today,
          voucher_no: voucher_no1,
          hotel_code,
        },
      ]);

      let voucher_type: "CCV" | "BCV" = "CCV";

      if (checkAccount[0].acc_type === "BANK") {
        voucher_type = "BCV";
      }

      const voucher_no = await helper.generateVoucherNo(voucher_type, trx);

      await accountModel.insertAccVoucher([
        {
          acc_head_id: checkAccount[0].acc_head_id,
          created_by: id,
          debit: 0,
          credit: netSalary,
          description: `Expense for payroll`,
          voucher_date: today,
          voucher_no,
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
        add_deductions,
        delete_deductions,
        add_allowances,
        delete_allowances,
        allowances,
        deductions,
        account_id,
        basic_salary,
        employee_id,
        leave_days,
        total_days,
        gurranted_leave_days,
        payroll_month,
        ...rest
      } = req.body as IpayrollUpdateRequestBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length)
        files.forEach(
          ({ fieldname, filename }) => (req.body[fieldname] = filename)
        );

      const employeeModel = this.Model.employeeModel(trx);
      const model = this.Model.payRollModel(trx);
      const accountModel = this.Model.accountModel(trx);

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

      const daily_rate = Number(basic_salary) / total_days;
      const unpaid_leave_days = total_days - gurranted_leave_days;
      const payable_days = total_days - unpaid_leave_days;

      const total_unpaid_leave_deduction_amount =
        daily_rate * unpaid_leave_days;

      const payable_basic = daily_rate * payable_days;

      let totalDeductionsAmount = 0;
      let totalAllowancesAmount = 0;

      if (add_deductions?.length) {
        const deductionsPayload: {
          employee_id: number;
          payroll_id: number;
          deduction_name: string;
          deduction_amount: number;
        }[] = add_deductions.map((deduction) => {
          const amount = Number(deduction.deduction_amount);
          totalDeductionsAmount = totalDeductionsAmount + amount;
          return {
            employee_id,
            payroll_id: Number(id),
            deduction_name: deduction.deduction_name,
            deduction_amount: amount,
          };
        });

        await model.createEmployeeDeductions(deductionsPayload);
      }

      if (delete_deductions?.length) {
        await model.deleteEmployeeDeductionsByIds({
          payroll_id: Number(id),
          ids: delete_deductions,
        });
      }

      if (add_allowances?.length) {
        const allowancesPayload: {
          payroll_id: number;
          employee_id: number;
          allowance_name: string;
          allowance_amount: number;
        }[] = add_allowances.map((allowance) => {
          const amount = Number(allowance.allowance_amount);
          totalAllowancesAmount = totalAllowancesAmount + amount;

          return {
            employee_id,
            payroll_id: Number(id),
            allowance_name: allowance.allowance_name,
            allowance_amount: amount,
          };
        });

        await model.createEmployeeAllowances(allowancesPayload);
      }

      if (delete_allowances?.length) {
        await model.deleteEmployeeAllowancesByIds({
          payroll_id: Number(id),
          ids: delete_allowances,
        });
      }

      const gross_salary = payable_basic + totalAllowancesAmount;

      const netSalary = gross_salary - totalDeductionsAmount;

      const payload: IUpdatePayrollBody = {
        ...rest,
        payment_method: account[0].acc_type,
        basic_salary,
        employee_id,
        payable_days,
        daily_rate,
        total_days,
        leave_days,
        unpaid_leave_deduction: total_unpaid_leave_deduction_amount,
        account_id,
        total_allowance: totalAllowancesAmount,
        total_deduction: totalDeductionsAmount,
        gross_salary,
        net_salary: netSalary,
        updated_by: admin_id,
        hotel_code,
        payroll_month,
      };

      await model.updatePayRoll({ id: parseInt(id), payload });

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
