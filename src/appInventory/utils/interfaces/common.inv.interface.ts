export interface ICreateCommonInvPayload {
	hotel_code?: number;
	name: string;
	short_code?: string;
	created_by: number;
}

export interface IUpdateCommonInvPayload {
	name?: string;
	short_code?: string;
	status?: number;
	updated_by?: number;
	is_deleted?: boolean;
}

export interface ICreateInvSupplierPayload {
	hotel_code?: number;
	res_id?: number;
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
	is_deleted?: boolean;
}
