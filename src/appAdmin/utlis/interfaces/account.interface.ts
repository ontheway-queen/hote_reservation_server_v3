export type accType = "CASH" | "BANK" | "MOBILE_BANKING";

export interface IAccountReqBody {
  ac_type: accType;
  name: string;
  account_number?: string;
  acc_opening_balance_type?: string;
  bank_name?: string;
  branch_name?: string;
  opening_balance?: number;
  acc_routing_no: string;
  acc_head_id?: number;
}
export interface IAccountCreateBody {
  ac_type: accType;
  hotel_code: number;
  name: string;
  account_number?: string;
  acc_opening_balance_type?: string;
  bank_name?: string;
  branch_name?: string;
  opening_balance?: number;
  acc_routing_no: string;
  acc_head_id?: number;
}

export interface IUpdateAccountBalance {
  account_id: number;
  trxn_amount: number;
  trxn_type_id: number;
  trxn_data: string;
  trxn_type: "DEBIT" | "CREDIT";
  user_id: number;
}
export interface ICreateBillAdjustment {
  amount: number;
  vouchar_no: string;
  note: string | undefined;
  org_agency: number;
  vendor_id: number | undefined;
  adjust_type: "DECREASE" | "INCREASE";
  bill_amount: number;
  bill_created_date: string;
  bill_created_by: number;
  bill_note: string;
  adjustment_user_type: "client" | "vendor";
}

export interface IAccounts {
  account_type: accType;
  account_name: string;
  account_number?: string;
  account_bank_name?: string;
  account_branch_name?: string;
  account_created_by?: number;
  account_updated_by?: number;
  account_routing_no: string;
}

export interface IAccountsTransaction {
  actransaction_type: "DEBIT" | "CREDIT";
  actransaction_accounts_id: number;
  actransaction_transaction_type_id: number | undefined;
  actransaction_amount: number;
  actransaction_date?: string;
  actransaction_note?: string;
  actransaction_created_by: number;
}

export interface IinsertLedger {
  ac_tr_ac_id: number;
  hotel_code: number;
  transaction_no: string;
  ledger_debit_amount?: number;
  ledger_credit_amount?: number;
  ledger_details: string;
}

export interface IinsertSupplierLedger {
  res_id: number;
  ac_tr_ac_id: number;
  acc_ledger_id: number;
  supplier_id: number;
  ledger_debit_amount?: number;
  ledger_credit_amount?: number;
  ledger_details: string;
}

export interface IupdateAccount {
  name?: string;
  bank?: string;
  branch?: string;
  account_number?: string;
  details?: string;
  last_balance?: number;
}
