export type AccTransactionParams = {
  from_date?: string;
  to_date?: string;
  headIds?: number[] | null;
  group_code?: string;
};

export interface AccountJournalTransactions {
  id: number;
  acc_head_id: number;
  voucher_no: string;
  voucher_date: string;
  voucher_type: string;
  description: string;
  debit: number;
  credit: number;
  acc_head_code: string;
  acc_head_name: string;
  parent_id: number;
  parent_acc_head_name: string;
  created_by: string;
  created_at: string;
}

export interface IStructuredJournal {
  id: number;
  date: string;
  voucher_no: string;
  description: string;
  created_by: string;
  created_at: string;
  entries: {
    debits: {
      parenHead: string;
      acc_head_name: string;
      acc_head_code: string;
      debit: number;
      credit: number;
    }[];
    credits: {
      parenHead: string;
      acc_head_name: string;
      acc_head_code: string;
      debit: number;
      credit: number;
    }[];
  };
}

export interface TrialBalanceTransactions {
  id: number;
  parent_id: number;
  code: string;
  name: string;
  group_code: string;
  group_name: string;
  debit: number | null;
  credit: number | null;
}

export interface AccountTrialBalance {
  id: number;
  parent_id: number | null;
  code: string;
  name: string;
  group_name: string;
  group_code: string;
  debit: number;
  credit: number;
  debit_sum: number;
  credit_sum: number;
  debit_balance: number;
  credit_balance: number;
  balance: number;
  children?: AccountTrialBalance[];
}
