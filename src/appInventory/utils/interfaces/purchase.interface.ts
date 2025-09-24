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
  supplier_id: number;
  debit: number;
  credit: number;
  ledger_details: string;
  voucher_no: string;
}
