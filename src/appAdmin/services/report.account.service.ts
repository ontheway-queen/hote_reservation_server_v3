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
import {
  AccountHead,
  AccTransactionParams,
} from "../utlis/interfaces/report.interface";

export class AccountReportService extends AbstractServices {
  constructor() {
    super();
  }

  public getJournalReport = async (req: Request) => {
    const journals = await this.Model.reportModel().getAccountsTransactions({
      ...req.query,
      hotel_code: req.hotel_admin.hotel_code,
    });

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

    const hotel_code = req.hotel_admin.hotel_code;

    const headSet = new Set<number>();

    const headIds: number[] = [];

    const model = this.Model.reportModel();
    const headInfo = await model.getAccHeadInfo(Number(head_id), hotel_code);
    if (!headInfo) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "No Account Found",
      };
    }

    headIds.push(Number(head_id));
    headSet.add(Number(head_id));
    const heads = await model.getAccHeads(hotel_code);

    for (const head of heads) {
      if (headSet.has(head.parent_id)) {
        headSet.add(head.id);
        headIds.push(head.id);
      }
    }

    const ledgers = await model.getAccountsTransactions({
      headIds,
      from_date,
      to_date,
      hotel_code: req.hotel_admin.hotel_code,
    });
    console.log({ ledgers });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: { ...headInfo, ledgers },
    };
  };

  public getTrialBalanceReport = async (req: Request) => {
    const payload = await this.Model.reportModel().getTrialBalanceReport({
      ...req.query,
      hotel_code: req.hotel_admin.hotel_code,
    });

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
    const model = this.Model.reportModel();

    const incomeData = await model.getTrialBalanceReport({
      from_date,
      to_date,
      group_code: INCOME_GROUP,
      hotel_code: req.hotel_admin.hotel_code,
    });

    const formattedIncomeData = ReportUtils.formatTrialBalance(incomeData);
    let incomeDebit = 0;
    let incomeCredit = 0;

    formattedIncomeData.forEach((item) => {
      incomeDebit += item.debit_balance;
      incomeCredit += item.credit_balance;
    });

    const expenseData = await model.getTrialBalanceReport({
      group_code: EXPENSE_GROUP,
      from_date,
      to_date,
      hotel_code: req.hotel_admin.hotel_code,
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

    const data = await conn.getTrialBalanceReport({
      ...req.query,
      hotel_code: req.hotel_admin.hotel_code,
    });

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

  public getAccHeadsForSelect = async (req: Request) => {
    const model = this.Model.reportModel();

    const data = await model.getAccHeadsForSelect(req.hotel_admin.hotel_code);

    const headMap = new Map<number, AccountHead>();

    console.log({ data });

    // Step 2: Populate the map with heads
    for (const item of data) {
      headMap.set(item.head_id, {
        head_id: item.head_id,
        head_parent_id: item.head_parent_id,
        head_code: item.head_code,
        head_group_code: item.head_group_code,
        head_name: item.head_name,
        parent_head_code: item.parent_head_code,
        parent_head_name: item.parent_head_name,
        children: [],
      });
    }

    // Step 3: Build the hierarchy
    const rootHeads: AccountHead[] = [];

    for (const head of headMap.values()) {
      if (head.head_parent_id === null) {
        // This is a root-level head
        rootHeads.push(head);
      } else {
        // Find the parent head
        const parentHead = headMap.get(head.head_parent_id);
        if (parentHead) {
          // Add this head as a child of the parent
          parentHead.children!.push(head);
        }
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: rootHeads,
    };
  };
}
export default AccountReportService;
