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
	res_id?: number;
	name: string;
	phone: string;
	created_by: number;
}

export interface IUpdateInvSupplierPayload {
	name?: string;
	phone?: string;
	status?: number;
	updated_by?: number;
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
