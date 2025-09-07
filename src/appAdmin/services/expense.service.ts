import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import ExpenseModel from "../../models/reservationPanel/expenseModel";
import {
  ICreateExpensebody,
  IUpdateExpenseHeadPayload,
} from "../utlis/interfaces/expense.interface";

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
      const checkAccount = await accountModel.getSingleAccount({
        hotel_code,
        id: rest.account_id,
      });

      if (!checkAccount.length) {
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

      const year = new Date().getFullYear();

      const expenseId = await model.getExpenseLastId();

      const expenseNo = expenseId.length ? expenseId[0].id + 1 : 1;

      const total_amount = expense_items.reduce(
        (acc, cu) => acc + cu.amount,
        0
      );

      // Insert expense record
      const payload = {
        ...rest,
        expense_no: `EXP-${year}${expenseNo}`,
        hotel_code,
        created_by,
        expense_amount: total_amount,
        acc_voucher_id: 77,
      };

      const expenseRes = await model.createExpense(payload);

      const expenseItemPayload = expense_items.map(
        (item: { id: number; remarks: string; amount: number }) => {
          return {
            expense_head_id: item.id,
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
