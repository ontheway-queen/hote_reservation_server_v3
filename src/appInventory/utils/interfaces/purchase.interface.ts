export interface ICreateInvPurchaseBody {
  hotel_code: number;
  purchase_date: Date;
  voucher_no?: string;
  supplier_id: number;
  invoice_id?: number;
  sub_total: number;
  vat: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  paid_amount: number;
  due: number;
}

export interface ICreateInvPurchasePayload {
  hotel_code: number;
  purchase_date: Date;
  supplier_id: number;
  ac_tr_ac_id: number;
  discount_amount: number;
  vat: number;
  shipping_cost: number;
  paid_amount: number;
  due: number;
  invoice_no: number;
  payment_type: any;
  purchase_items: ICreateInvPurchaseItemBody[];
}

export interface ICreateInvPurchaseItemBody {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  purchase_id: number;
}

export interface IinsertInvSupplierLedger {
  hotel_code: number;
  res_id?: number;
  ac_tr_ac_id?: number;
  acc_ledger_id?: number;

  supplier_id: number;
  ledger_debit_amount?: number;
  ledger_credit_amount?: number;
  ledger_details: string;
}
