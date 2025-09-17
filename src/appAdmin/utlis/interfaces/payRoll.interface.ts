export interface ICreatePayrollBody {
	hotel_code: number;
	employee_id: number;
	account_id: number;
	payment_method: "BANK" | "CASH" | "MOBILE_BANKING" | string;
	basic_salary: number;
	salary_basis: "calendar" | "working" | string;
	total_days: number;
	payable_days: number;
	leave_days?: number;
	unpaid_leave_days?: number;
	unpaid_leave_deduction?: number;
	daily_rate: number;
	gross_salary: number;
	net_salary: number;
	docs?: string;
	note?: string;
	salary_date: string;
	created_by: number;
	updated_by?: number;
	is_deleted?: boolean;
	deleted_by?: number;
	deleted_at?: Date;
}

export interface ICreatedeductionBody {
	payroll_id: number;
	deduction_amount: number;
	deduction_name: string;
	employee_id: number;
}

export interface ICreateAdditionBody {
	payroll_id: number;
	allowance_amount: number;
	allowance_name: number;
	employee_id: number;
}

export interface IServiceChargeDistribution {
	month: string;
	employee_id: number;
	percentage: number;
	amount: number;
	hotel_code: number;
	payroll_id: number;
}

export interface IInsertPaySlip {
	payroll_id: number;
	file_url: string;
}

export interface ISinglePayroll {
	id: number;
	hotel_name: string;
	hotel_address: string;
	country_code: string;
	city_code: number;
	postal_code: any;
	employee_id: number;
	account_id: number;
	employee_name: string;
	employee_designation: string;
	employee_phone: string;
	total_allowance: string;
	total_deduction: string;
	unpaid_leave_days: number;
	leave_days: number;
	salary_basis: string;
	unpaid_leave_deduction: string;
	payable_days: number;
	daily_rate: string;
	basic_salary: string;
	gross_salary: string;
	net_salary: string;
	salary_date: string;
	note: string;
	total_days: number;
	docs: any;
	created_by: number;
	created_by_name: string;
	deductions: Deduction[];
	allowances: Allowance[];
}

export interface Deduction {
	id: number;
	is_deleted: boolean;
	deduction_name: string;
	deduction_amount: number;
}

export interface Allowance {
	id: number;
	is_deleted: boolean;
	allowance_name: string;
	allowance_amount: number;
}

export interface IPayrollList {
	id: number;
	employee_name: string;
	designation: string;
	total_allowance: string;
	total_deduction: string;
	basic_salary: string;
	gross_salary: string;
	net_salary: string;
	salary_date: string;
}
