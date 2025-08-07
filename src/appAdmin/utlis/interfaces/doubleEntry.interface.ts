export type idType = number | string;

export interface IinsertAccHeadReqBodyForMpanel {
  group_code: string;
  hotel_code: number;
  parent_id?: number;
  name: string[];
}
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
  created_by?: number;
}

export interface IInsertVoucherPayload {
  acc_head_id: number;
  voucher_no: string;
  voucher_date: string;
  debit: number;
  credit: number;
  description: string;
  created_by: number;
  hotel_code: number;
}
export interface IUpdateVoucherPayload {
  voucher_no: string;
  voucher_date: string;
  debit: number;
  credit: number;
  description: string;
}
