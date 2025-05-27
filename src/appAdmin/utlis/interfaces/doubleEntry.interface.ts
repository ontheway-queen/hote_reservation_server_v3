export type idType = number | string;

export interface IinsertAccHeadReqBody {
  group_code: string;
  parent_id?: number;
  name: string[];
}

export interface IAccHeadDb {
  group_code: idType;
  name: string;
  parent_id: number | undefined;
  code: idType;
  hotel_code: number;
  created_by: number;
}

export type paymentType =
  | "REFUND"
  | "INVOICE"
  | "EMD"
  | "AIR_TICKET_VOID"
  | "RECEIPT"
  | "OPENING_BALANCE"
  | "INVESTMENT"
  | "ADVANCE"
  | "EXPENSE"
  | "PAYMENT"
  | "PAYROLL"
  | "LOAN"
  | "LOAN_PAYMENT"
  | "LOAN_RECEIVE";

export interface IVoucher {
  org_id: number;
  acc_head_id: number;
  voucher_no: string;
  voucher_date: string;
  serial_no: number;
  debit: number;
  credit: number;
  payment_method?: number;
  payment_type: paymentType;
  is_cheque?: 0 | 1;
  cheque_no?: string;
  cheque_date?: string;
  bank_name?: string;
  description: string;
  created_by: number;
}
