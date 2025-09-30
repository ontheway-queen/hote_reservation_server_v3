import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import Lib from "../../utils/lib/lib";
import {
  ICreateExpensebody,
  IUpdateExpenseReqBody,
} from "../utlis/interfaces/expense.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

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
      console.log(2);
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
        (item: {
          expense_head_id: number;
          remarks: string;
          amount: number;
        }) => {
          return {
            expense_head_id: item.expense_head_id,
            remarks: item.remarks,
            amount: item.amount,
            expense_id: expenseRes[0].id,
            ex_voucher_id: vourcherRes[0].id,
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

  public async updateExpenseService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { id: user_id, hotel_code } = req.hotel_admin;
      const { expense_items, ...rest } = req.body as IUpdateExpenseReqBody;
      console.log({ expense_items, data: rest });

      const expenseModel = this.Model.expenseModel(trx);
      const employeeModel = this.Model.employeeModel(trx);

      const [expense] = await expenseModel.getSingleExpense(
        parseInt(id),
        hotel_code
      );
      if (!expense) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const expenseId = expense.id;

      if (Array.isArray(expense_items) && expense_items.length) {
        const existingItems = await expenseModel.getExpenseItemByExpenseId(
          expenseId
        );

        const existingMap = new Map(existingItems.map((it) => [it.id, it]));

        await Promise.all(
          expense_items.map(async (item: any) => {
            const normalizedItem = {
              ...item,
              is_deleted: item.is_deleted === 1 || item.is_deleted === "1",
            };
            if (item.id && existingMap.has(item.id)) {
              await expenseModel.updateExpenseItems({
                id: item.id,
                payload: normalizedItem,
              });
            } else {
              await expenseModel.createExpenseItem({
                expense_id: expenseId,
                expense_head_id: existingItems[0]?.expense_head_id,
                ...normalizedItem,
              });
            }
          })
        );

        const updatedItems = await expenseModel.getExpenseItemByExpenseId(
          expenseId
        );
        const totalAmount = updatedItems
          .filter((item) => !item.is_deleted)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        await expenseModel.updateExpense({
          id: expenseId,
          hotel_code,
          payload: { expense_amount: totalAmount },
        });
      }

      const files = req.files;
      if (Array.isArray(files) && files.length) {
        for (const file of files) {
          const { fieldname, filename } = file;
          if (fieldname === "file_1") rest.expense_voucher_url_1 = filename;
          if (fieldname === "file_2") rest.expense_voucher_url_2 = filename;
        }
      }

      if (rest && Object.keys(rest).length) {
        if (rest.expense_by) {
          const employee = await employeeModel.getSingleEmployee(
            rest.expense_by,
            hotel_code
          );
          if (!employee) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: this.ResMsg.HTTP_NOT_FOUND,
            };
          }
        }

        if (rest.account_id) {
          const accountModel = this.Model.accountModel(trx);
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
        }

        await expenseModel.updateExpense({
          id: Number(id),
          hotel_code,
          payload: {
            ...rest,
            updated_by: user_id,
            updated_at: new Date().toUTCString(),
          },
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async deleteExpenseService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { id: user_id, hotel_code } = req.hotel_admin;

      const expenseModel = this.Model.expenseModel();

      const isExpenseExists = await expenseModel.getSingleExpense(
        parseInt(id),
        hotel_code
      );

      if (!isExpenseExists.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const expenseItems = await expenseModel.getExpenseItemByExpenseId(
        isExpenseExists[0].id
      );

      if (expenseItems.length) {
        await expenseModel.deleteExpenseItem(isExpenseExists[0].id);
      }

      const data = await expenseModel.deleteExpense({
        id: Number(id),
        payload: {
          hotel_code,
          deleted_by: user_id,
          is_deleted: true,
        },
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
export default ExpenseService;
