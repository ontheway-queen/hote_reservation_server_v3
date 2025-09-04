export interface ICreateBtocInvoicePayload {
  user_id: number;
  ref_id: number;
  ref_type: string;
  total_amount: number;
  due: number;
  details: string;
  invoice_number: string;
}
