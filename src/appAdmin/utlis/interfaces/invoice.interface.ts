export interface IinsertFolioPayload {
  hotel_code: number;
  guest_id?: number;
  parent_folio_id?: number;
  room_id?: number;
  window_no?: number;
  name: string;
  booking_id: number;
  folio_number: string;
  type:
    | "Primary"
    | "Split"
    | "Company"
    | "Custom"
    | "group_master"
    | "room_primary"
    | "company_pay"
    | "guest_pay"
    | "incidentals";
  status: "open" | "closed";
}

export interface IinsertFolioEntriesPayload {
  folio_id: number;
  acc_voucher_id?: number;
  debit?: number;
  credit?: number;
  description?: string;
  room_id?: number;
  window_no?: number;
  date?: string;
  rack_rate?: number;
  posting_type:
    | "Charge"
    | "Payment"
    | "Adjustment"
    | "Refund"
    | "Discount"
    | "Tax"
    | "Deposit";
}

export interface IinsertFolioInvoiceReqPayload {
  guest_id: number;
  booking_id: number;
  discount_amount: number;
  notes: string;
  folio_entry_ids: [
    {
      folio_id: number;
      entry_ids: number[];
    }
  ];
}
export interface IinsertinvoicePayload {
  invoice_no: string;
  hotel_code: number;
  user_id?: number;
  discount_amount: number;
  tax_amount?: number;
  vat?: number;
  sub_total: number;
  grand_total: number;
  due: number;
  description: string;
  type: "online_site" | "front_desk";
  created_by: number;
}

export interface IinsertinvoiceItemPayload {
  invoice_id: number;
  name?: string;
  discount?: number;
  total_price: number;
  quantity: number;
}

export interface IinvoiceItemPayload {
  name: string;
  total_price: number;
  quantity: number;
}

export interface IcreateInvoicePayload {
  user_id: number;
  discount_amount: number;
  tax_amount: number;
  invoice_item: IinvoiceItemPayload[];
}

export interface IcreateMoneyReciept {
  hotel_code: number;
  user_id?: number;
  money_receipt_no: string;
  description: string;
  inv_id?: number;
  total_collected_amount: number;
  created_by: number;
  payment_type: "bank" | "cash" | "cheque" | "mobile-banking";
  remarks: string;
  return_date?: string;
  ac_ldg_id?: number;
  ac_tr_ac_id: number;
}

export interface IinsertMoneyRecieptItem {
  money_reciept_id: number;
  invoice_id: number;
  paid?: number;
}

type FolioInvoiceItem = {
  id: number;
  folio_entry_id: number;
  description: string;
  type: string;
  debit: number;
  credit: number;
};

export type ISingleFolioInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  status: string;
  is_individual_booking: boolean;
  notes: string | null;
  inv_items: FolioInvoiceItem[];
};

export interface IFolioEntry {
  entries_id: number;
  description: string | null;
  posting_type: string;
  debit: number | null;
  credit: number | null;
  created_at: Date;
  is_void: boolean;
  invoiced: boolean;
  date: Date;
  room_id: number;
  room_name: string | null;
}

export interface IFolioWithEntries {
  id: number;
  name: string;
  is_void: boolean;
  folio_entries: IFolioEntry[]; // comes from JSON_AGG
}
