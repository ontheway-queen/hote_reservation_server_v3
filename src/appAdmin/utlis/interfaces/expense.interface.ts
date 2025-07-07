export interface ICreateExpenseHeadPayload {
	res_id?: number;
	hotel_code: number;
	name: string;
	created_by: number;
}

export interface IUpdateExpenseHeadPayload {
	hotel_code: number;
	name: string;
}

export interface ICreateExpensebody {
	hotel_code: number;
	name: string;
	ac_tr_ac_id: number;
	remarks: string;
	expense_date?: Date;
	voucher_no: string;
	expense_item: any[];
}

export interface ICreateExpensePayload {
	hotel_code: number;
	name: string;
	ac_tr_ac_id: number;
	remarks: string;
	expense_date?: Date;
	voucher_no: string;
	created_by: number;
	total: number;
}
