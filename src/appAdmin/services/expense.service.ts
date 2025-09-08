import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import ExpenseModel from "../../models/reservationPanel/expenseModel";
import {
  ICreateExpensebody,
  IUpdateExpenseHeadPayload,
} from "../utlis/interfaces/expense.interface";
import { HelperFunction } from "../utlis/library/helperFunction";
import Lib from "../../utils/lib/lib";

export class ExpenseService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllExpenseHead(req: Request) {
    const data = await this.Model.expenseModel().getExpenseHeads({
      search: req.query.search as string,
      hotel_code: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async createExpense(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code, id: created_by } = req.hotel_admin;
      const { expense_items, ...rest } = req.body as ICreateExpensebody;

      const files = req.files;
      if (Array.isArray(files) && files.length) {
        files.forEach((file) => {
          const { fieldname, filename } = file;
          switch (fieldname) {
            case "file_1":
              rest.expense_voucher_url_1 = filename as string;
              break;
            case "file_2":
              rest.expense_voucher_url_2 = filename;
              break;
          }
        });
      }

      const accountModel = this.Model.accountModel(trx);
      const employeeModel = this.Model.employeeModel(trx);
      const model = this.Model.expenseModel(trx);

      // account check
      const [acc] = await accountModel.getSingleAccount({
        hotel_code,
        id: rest.account_id,
      });

      if (!acc) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Account not found",
        };
      }

      const getSingleEmployee = await employeeModel.getSingleEmployee(
        rest.expense_by,
        hotel_code
      );

      if (!getSingleEmployee) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Employee not found",
        };
      }

      const total_amount = expense_items.reduce(
        (acc, cu) => acc + cu.amount,
        0
      );

      // ___________________________________  Accounting _________________________________//

      // accounting
      const helper = new HelperFunction();
      const hotelModel = this.Model.HotelModel(trx);

      const heads = await hotelModel.getHotelAccConfig(hotel_code, [
        "HOTEL_EXPENSE_HEAD_ID",
      ]);

      const expense_head = heads.find(
        (h) => h.config === "HOTEL_EXPENSE_HEAD_ID"
      );

      if (!expense_head) {
        throw new Error("HOTEL_EXPENSE_HEAD_ID not configured for this hotel");
      }

      const sales_head = heads.find(
        (h) => h.config === "HOTEL_REVENUE_HEAD_ID"
      );
      if (!sales_head) {
        throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
      }

      if (!acc) throw new Error("Invalid Account");

      let voucher_type: "CCV" | "BCV" | "DV" = "DV";

      const voucher_no = await helper.generateVoucherNo(voucher_type, trx);

      // generate expense no
      const expenseNo = await Lib.generateExpenseNo(trx);

      const vourcherRes = await accountModel.insertAccVoucher([
        {
          acc_head_id: expense_head.head_id,
          created_by,
          debit: total_amount,
          credit: 0,
          description: `Expense for ${expenseNo}`,
          voucher_date: req.body.expense_date,
          voucher_no,
          hotel_code,
        },
        {
          acc_head_id: acc.acc_head_id,
          created_by,
          debit: 0,
          credit: total_amount,
          description: `Expense for ${expenseNo}`,
          voucher_date: new Date().toUTCString(),
          voucher_no,
          hotel_code,
        },
      ]);

      //_______________________________________ END _________________________________//

      // Insert expense record
      const payload = {
        ...rest,
        expense_no: expenseNo,
        hotel_code,
        created_by,
        expense_amount: total_amount,
        acc_voucher_id: vourcherRes[1].id,
      };

      const expenseRes = await model.createExpense(payload);

      const expenseItemPayload = expense_items.map(
        (item: { id: number; remarks: string; amount: number }) => {
          return {
            expense_head_id: vourcherRes[0].id,
            remarks: item.remarks,
            amount: item.amount,
            expense_id: expenseRes[0].id,
          };
        }
      );

      await model.createExpenseItem(expenseItemPayload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Expense created successfully.",
      };
    });
  }

  public async getAllExpense(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { from_date, to_date, limit, skip, key } = req.query;

    const { data, total } = await this.Model.expenseModel().getAllExpense({
      from_date: from_date as string,
      to_date: to_date as string,
      limit: limit as string,
      skip: skip as string,
      key: key as string,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleExpense(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.expenseModel().getSingleExpense(
      parseInt(id),
      hotel_code
    );

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }
}
export default ExpenseService;
