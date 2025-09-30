export interface IOrderRequest {
	staff_id?: number;
	order_type: string;
	customer: string;
	table_id: number;
	total: number;
	service_charge: number;
	service_charge_type: "percentage" | "fixed";
	discount?: number;
	discount_type?: "percentage" | "fixed";
	vat_rate: number;
	sub_total: number;
	grand_total: number;
	room_no?: number;
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
	customer: string;
	total: number;
	service_charge: number;
	service_charge_type: string;
	discount?: number;
	discount_type?: string;
	vat_rate: number;
	vat_amount: number;
	sub_total: number;
	grand_total: number;
	room_no?: number;
}

export interface IOrderItemsPayload {
	order_id: number;
	food_id: number;
	name: string;
	rate: number;
	quantity: number;
	total: number;
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
	total: string;
	discount: string;
	service_charge: string;
	service_charge_type: string;
	sub_total: string;
	vat_rate: string;
	vat_amount: string;
	grand_total: string;
	created_by_id: number;
	created_by_name: string;
	is_paid: boolean;
	room_no: number | null;
	customer: string | null;
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
	customer?: string | null;
	table_id?: number;
	staff_id?: number;
	room_no?: any;
	discount?: number;
	discount_type?: string | null;
	service_charge?: number;
	service_charge_type?: string;
	vat_rate?: number;
	vat_amount?: number;
	total?: number;
	sub_total?: number;
	grand_total?: number;
	updated_by?: number;
	kitchen_status?: string;
}

export interface IUpdateOrderItemsPayload {
	food_id?: number;
	quantity?: number;
}
