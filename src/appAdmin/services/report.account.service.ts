import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import ReportUtils from "../utlis/library/account.utils";
import {
  ASSET_GROUP,
  CAPITAL_GROUP,
  DIVIDEND_GROUP,
  EXPENSE_GROUP,
  INCOME_GROUP,
  LIABILITY_GROUP,
} from "../../utils/miscellaneous/constants";
import { AccTransactionParams } from "../utlis/interfaces/report.interface";

export class AccountReportService extends AbstractServices {
  constructor() {
    super();
  }

  // get account report
  public async getAccountReport(req: Request) {
    const { from_date, to_date, name, limit, skip } = req.query;
    const { hotel_code } = req.hotel_admin;
    // model
    const model = this.Model.reportModel();

    const { data, total, totalDebitAmount, totalCreditAmount } =
      await model.getAccountReport({
        from_date: from_date as string,
        to_date: to_date as string,
        hotel_code,
        name: name as string,
        limit: limit as string,
        skip: skip as string,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      totalDebitAmount,
      totalCreditAmount,
      data,
    };
  }

  //<sabbir.m360ict@gmail.com> ---- Sabbir Hosen;
  // Account Reports

  public getJournalReport = async (req: Request) => {
    const conn = this.Model.reportModel();

    const journals = await conn.getAccountsTransactions(req.query);

    const data = ReportUtils.formatJournal(journals);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  };

  public getAccLedger = async (req: Request) => {
    const { from_date, to_date, head_id } = req.query as {
      from_date: string;
      to_date: string;
      head_id: string;
    };

    const headSet = new Set<number>();
    const headIds: number[] = [];

    const conn = this.Model.reportModel();
    const headInfo = await conn.getAccHeadInfo(+head_id);
    if (!headInfo) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "No Account Found",
      };
    }

    headIds.push(+head_id);
    headSet.add(+head_id);
    const heads = await conn.getAccHeads();

    for (const head of heads) {
      if (headSet.has(head.parent_id)) {
        headSet.add(head.id);
        headIds.push(head.id);
      }
    }

    const ledgers = await conn.getAccountsTransactions({
      headIds,
      from_date,
      to_date,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: { ...headInfo, ledgers },
    };
  };

  public getTrialBalanceReport = async (req: Request) => {
    const conn = this.Model.reportModel();

    const payload = await conn.getTrialBalanceReport(req.query);

    const data = ReportUtils.formatTrialBalance(payload);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  };

  public getIncomeStatement = async (req: Request) => {
    const { from_date, to_date } = req.query as AccTransactionParams;
    const conn = this.Model.reportModel();

    const incomeData = await conn.getTrialBalanceReport({
      from_date,
      to_date,
      group_code: INCOME_GROUP,
    });

    const formattedIncomeData = ReportUtils.formatTrialBalance(incomeData);
    let incomeDebit = 0;
    let incomeCredit = 0;

    formattedIncomeData.forEach((item) => {
      incomeDebit += item.debit_balance;
      incomeCredit += item.credit_balance;
    });

    const expenseData = await conn.getTrialBalanceReport({
      group_code: EXPENSE_GROUP,
      from_date,
      to_date,
    });

    const formattedExpenseData = ReportUtils.formatTrialBalance(expenseData);

    let expenseDebit = 0;
    let expenseCredit = 0;

    formattedExpenseData.forEach((item) => {
      expenseDebit += item.debit_balance;
      expenseCredit += item.credit_balance;
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        profitLoss: incomeCredit - incomeDebit - (expenseDebit - expenseCredit),
        income: {
          totalDebit: incomeDebit,
          totalCredit: incomeCredit,
          heads: formattedIncomeData,
        },
        expense: {
          totalDebit: expenseDebit,
          totalCredit: expenseCredit,
          heads: formattedExpenseData,
        },
      },
    };
  };

  public getBalanceSheet = async (req: Request) => {
    const conn = this.Model.reportModel();

    const data = await conn.getTrialBalanceReport(req.query);

    const formattedData = ReportUtils.formatTrialBalance(data);

    const assets = [];
    const liabilities = [];
    const capitals = [];
    const income = [];
    const expense = [];
    const dividend = [];

    for (const item of formattedData) {
      if (item.group_code === ASSET_GROUP) {
        assets.push(item);
      } else if (item.group_code === LIABILITY_GROUP) {
        liabilities.push(item);
      } else if (item.group_code === CAPITAL_GROUP) {
        capitals.push(item);
      } else if (item.group_code === INCOME_GROUP) {
        income.push(item);
      } else if (item.group_code === EXPENSE_GROUP) {
        expense.push(item);
      } else if (item.group_code === DIVIDEND_GROUP) {
        dividend.push(item);
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        assets,
        liabilities,
        capitals,
        income,
        expense,
        dividend,
      },
    };
  };
}
export default AccountReportService;
