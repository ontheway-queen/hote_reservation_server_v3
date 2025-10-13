export interface IOrderRequest {
  staff_id?: number;
  order_type: string;
  guest_name: string;
  room_no?: number;
  table_id: number;
  discount_type?: "percentage" | "fixed";
  discount: number;
  net_total: number;
  service_charge: number;
  service_charge_type: "percentage" | "fixed";
  vat_type: "percentage" | "fixed";
  vat: number;
  order_items: [
    {
      food_id: number;
      quantity: number;
    }
  ];
}

export interface IOrderPayload {
  hotel_code: number;
  restaurant_id: number;
  table_id: number;
  staff_id?: number;
  order_no: string;
  created_by: number;
  order_type: string;
  guest_name: string;
  room_no?: number;
  sub_total: number;
  discount_type?: string;
  discount?: number;
  service_charge_type: string;
  service_charge: number;
  vat_type: string;
  vat: number;
  grand_total: number;
  discount_amount: number;
  service_charge_amount: number;
  vat_amount: number;
  credit_voucher_id: number;
}

export interface IOrderItemsPayload {
  order_id: number;
  food_id: number;
  name: string;
  rate: number;
  quantity: number;
  total: number;
  debit_voucher_id: number;
}

export interface IGetOrders {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  table_id: number;
  table_name: string;
  order_type: string;
  status: string;
  kitchen_status: string;
  created_at: string;
  total: string;
  discount: string;
  service_charge: string;
  sub_total: string;
  vat_amount: string;
  grand_total: string;
  created_by_id: number;
  created_by_name: string;
}

export interface IGetOrder {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  table_id: number;
  table_name: string;
  order_no: string;
  staff_id: number;
  staff_name: string;
  order_type: string;
  status: string;
  kitchen_status: string;
  created_at: string;
  discount: string;
  service_charge: string;
  service_charge_type: string;
  sub_total: string;
  vat_type: string;
  vat: string;
  grand_total: string;
  created_by_id: number;
  debit_voucher_id: number;
  credit_voucher_id: number;
  created_by_name: string;
  is_paid: boolean;
  room_no: number | null;
  guest: string | null;
  discount_type: string | null;
  order_items: IGetOrderItem[];
}

export interface IGetOrderItem {
  id: number;
  food_id: number;
  food_name: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface IGetKitchenOrders {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  order_no: string;
  table_name: string;
  staff_name: string;
  room_no: any;
  order_type: string;
  kitchen_status: string;
  created_at: string;
  order_items: IGetKitchenOrderItem[];
}

export interface IGetKitchenOrderItem {
  food_name: string;
  quantity: number;
}

export interface IUpdateOrderRequest extends Partial<IOrderRequest> {
  id?: number;
  status?: string;
  kitchen_status?: string;
}

export interface IUpdateOrderPayload {
  order_type?: string;
  guest_name?: string | null;
  table_id?: number;
  staff_id?: number;
  room_no?: any;
  sub_total?: number;
  discount?: number;
  discount_type?: string | null;
  net_total?: number;
  service_charge?: number;
  service_charge_type?: string;
  vat_type?: string;
  vat?: number;
  grand_total?: number;
  updated_by?: number;
  kitchen_status?: string;
  discount_amount?: number;
  service_charge_amount?: number;
  vat_amount?: number;
  credit_voucher_id?: number;
}

export interface IUpdateOrderItemsPayload {
  food_id?: number;
  quantity?: number;
}
