export interface ICreateCommonInvPayload {
	hotel_code?: number;
	name: string;
	short_code?: string;
	created_by: number;
}

export interface IUpdateCommonInvPayload {
	name: string;
	status: boolean;
	short_code?: string;
}

export interface ICreateInvSupplierPayload {
	hotel_code?: number;
	name: string;
	phone: string;
	last_balance: number;
	created_by: number;
}

export interface IUpdateInvSupplierPayload {
	name?: string;
	phone?: string;
	status?: number;
	last_balance?: number;
}

export interface ICategoryResponse {
	id: number;
	hotel_code: number;
	name: string;
	status: boolean;
	created_by_id: number;
	created_by_name: string;
	is_deleted: boolean;
}
