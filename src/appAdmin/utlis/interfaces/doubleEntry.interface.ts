export type idType = number | string;

export interface IinsertAccHeadReqBody {
  group_code: string;
  parent_id?: number;
  name: string[];
}

export interface IAccHeadDb {
  group_code: idType;
  name: string;
  parent_id?: number;
  code: idType;
  hotel_code: number;
  created_by: number;
}

export type voucherType =
  | 'REFUND'
  | 'INVOICE'
  | 'EMD'
  | 'AIR_TICKET_VOID'
  | 'RECEIPT'
  | 'OPENING_BALANCE'
  | 'INVESTMENT'
  | 'ADVANCE'
  | 'EXPENSE'
  | 'PAYMENT'
  | 'PAYROLL'
  | 'LOAN'
  | 'LOAN_PAYMENT'
  | 'LOAN_RECEIVE'
  | 'JOURNAL';

export interface IVoucher {
  acc_head_id: number;
  voucher_no: string;
  voucher_date: string;
  debit: number;
  credit: number;
  voucher_type: voucherType;
  description: string;
  created_by: number;
}
