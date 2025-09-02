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

export interface IExpenseHeadQuery {
	id: number;
	name: string;
	created_by_id: number;
	created_by_name: string;
	is_deleted: boolean;
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

export interface IExpenseWithItems {
	id: number;
	voucher_no: string;
	account_id: number;
	expense_date: string;
	expense_name: string;
	account_name: string;
	account_type: string;
	expense_amount: string;
	created_at: string;
	hotel_code?: number;
	account_number?: string;
	hotel_name?: string;
	bank_name?: string;
	branch?: string;
	hotel_address?: string;
	expense_items: ExpenseItem[];
}

export interface ExpenseItem {
	id: number;
	item_name: string;
	amount: number;
}
