import {
  ASSET_GROUP,
  DIVIDEND_GROUP,
  EXPENSE_GROUP,
} from "../../../utils/miscellaneous/constants";
import {
  AccountJournalTransactions,
  AccountTrialBalance,
  IStructuredJournal,
  TrialBalanceTransactions,
} from "../interfaces/report.interface";

export default class ReportUtils {
  public static formatJournal = (
    payload: AccountJournalTransactions[]
  ): IStructuredJournal[] => {
    const structureData: IStructuredJournal[] = [];

    for (const [index, item] of payload.entries()) {
      const {
        acc_head_code,
        acc_head_name,
        parent_acc_head_name,
        voucher_date,
        credit,
        debit,
        description,
        created_at,
        created_by,
        voucher_no,
      } = item;

      const found = structureData.find(
        (sItem) => voucher_no === sItem.voucher_no
      );

      if (found) {
        if (Number(credit) === 0) {
          found.entries.debits.push({
            parenHead: parent_acc_head_name,
            acc_head_name,
            acc_head_code,
            debit: debit,
            credit: credit,
          });
        } else {
          found.entries.credits.push({
            parenHead: parent_acc_head_name,
            acc_head_name,
            acc_head_code,
            debit: debit,
            credit: credit,
          });
        }
      } else {
        if (Number(item.credit) === 0) {
          structureData.push({
            id: index + 1,
            date: voucher_date,
            voucher_no: voucher_no,
            description: description,
            created_by,
            created_at: created_at,
            entries: {
              debits: [
                {
                  parenHead: parent_acc_head_name,
                  acc_head_name,
                  acc_head_code,
                  debit: debit,
                  credit: credit,
                },
              ],
              credits: [],
            },
          });
        } else {
          structureData.push({
            id: index + 1,
            date: voucher_date,
            voucher_no: voucher_no,
            description: description,
            created_by,
            created_at: created_at,
            entries: {
              debits: [],
              credits: [
                {
                  parenHead: parent_acc_head_name,
                  acc_head_name,
                  acc_head_code,
                  debit: debit,
                  credit: credit,
                },
              ],
            },
          });
        }
      }
    }

    return structureData;
  };

  public static formatTrialBalance(
    data: TrialBalanceTransactions[],
    parentId: null | number = null
  ): AccountTrialBalance[] {
    const result: AccountTrialBalance[] = [];

    for (const item of data) {
      if (item.parent_id === parentId) {
        const children = this.formatTrialBalance(data, item.id);

        let total_debit = children.reduce(
          (sum, child) =>
            sum + Number(child.debit_sum) || Number(child.debit) || 0,
          0
        );

        let total_credit = children.reduce(
          (sum, child) =>
            sum + Number(child.credit_sum) || Number(child.credit) || 0,
          0
        );

        total_debit += item.debit ? Number(item.debit) : 0;
        total_credit += item.credit ? Number(item.credit) : 0;

        const account: AccountTrialBalance = {
          id: item.id,
          parent_id: item.parent_id,
          code: item.code,
          name: item.name,
          group_name: item.group_name,
          group_code: item.group_code,
          debit: item.debit ? Number(item.debit) : 0,
          credit: item.credit ? Number(item.credit) : 0,
          debit_sum: total_debit,
          credit_sum: total_credit,
          debit_balance: 0,
          credit_balance: 0,
          balance: 0,
          children: children.length ? children : [],
        };

        if (
          item.group_code === ASSET_GROUP ||
          item.group_code === EXPENSE_GROUP ||
          item.group_code === DIVIDEND_GROUP
        ) {
          const balance = total_debit - total_credit;
          account.balance = balance;
          if (balance > 0) {
            account.debit_balance = balance;
            account.credit_balance = 0;
          } else {
            account.debit_balance = 0;
            account.credit_balance = Math.abs(balance);
          }
        } else {
          const balance = total_credit - total_debit;
          account.balance = balance;

          if (balance > 0) {
            account.debit_balance = 0;
            account.credit_balance = balance;
          } else {
            account.debit_balance = Math.abs(balance);
            account.credit_balance = 0;
          }
        }

        result.push(account);
      }
    }

    return result;
  }
}
