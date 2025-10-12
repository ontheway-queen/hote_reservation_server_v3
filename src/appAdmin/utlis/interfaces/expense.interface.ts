export interface ICreateExpenseHeadPayload {
  res_id?: number;
  hotel_code: number;
  name: string;
  created_by: number;
}

export interface IUpdateExpenseHeadPayload {
  hotel_code: number;
  name: string;
}

export interface IExpenseHeadQuery {
  id: number;
  name: string;
  created_by_id: number;
  created_by_name: string;
  is_deleted: boolean;
}

export interface ICreateExpensebody {
  hotel_code: number;
  expense_by: number;
  expense_head_id: number;
  expense_no: string;
  expense_date: string;
  expense_items: {
    expense_head_id: number;
    remarks: string;
    amount: number;
  }[];
  pay_method: string;
  account_id: number;
  expense_note: string;
  expense_voucher_url_1?: string;
  expense_voucher_url_2?: string;
}

export interface ICreateExpensePayload {
  hotel_code: number;
  voucher_no?: string;
  expense_date?: string;
  expense_by: number;
  pay_method: string;
  transaction_no?: string;
  expense_cheque_id?: number;
  bank_name?: string;
  branch_name?: string;
  cheque_no?: number;
  cheque_date?: string;
  deposit_date?: string;
  account_id?: number;
  expense_amount: number;
  expense_note?: string;
  acc_voucher_id?: number;
  expense_voucher_url_1?: string;
  expense_voucher_url_2?: string;
  created_by: number;
}

export interface IgetAllExpenseWithItems {
  id: number;
  expense_no: string;
  account_id: number;
  acc_voucher_id: number;
  expense_date: string;
  expense_name: string;
  account_name: string;
  account_type: string;
  expense_amount: string;
  created_at: string;
  hotel_code?: number;
  account_number?: string;
  hotel_name?: string;
  bank_name?: string;
  branch?: string;
  hotel_address?: string;
  expense_by_id: number;
  expense_by_name: string;
  file_1?: string;
  file_2?: string;
  expense_items: ExpenseItem[];
}
export interface IgetSingleExpenseWithItems {
  id: number;
  expense_no: string;
  account_id: number;
  acc_voucher_id: number;
  expense_date: string;
  expense_name: string;
  account_name: string;
  account_type: string;
  expense_amount: string;
  created_at: string;
  hotel_code?: number;
  account_number?: string;
  hotel_name?: string;
  bank_name?: string;
  branch?: string;
  hotel_address?: string;
  expense_by_id: number;
  expense_by_name: string;
  file_1?: string;
  file_2?: string;
  expense_items: ExpenseItem[];
}

export interface ExpenseItem {
  id: number;
  item_name: string;
  amount: number;
  ex_voucher_id: number;
  expense_head_id: number;
  expense_id: number;
}

interface updateExpenseItem {
  id?: number;
  expense_head_id: number;
  remarks: string;
  amount: number;
  is_deleted?: number; // 0 or 1
}

export interface IUpdateExpenseReqBody {
  expense_by?: number;
  expense_date?: string;
  expense_note?: string;
  account_id?: number;
  pay_method?: "CASH" | "BANK" | "MOBILE_BANKING" | "CHEQUE";
  cheque_no?: string;
  cheque_date?: string;
  bank_name?: string;
  branch_name?: string;
  expense_voucher_url_1?: string;
  expense_voucher_url_2?: string;
  expense_items?: updateExpenseItem[];
}
