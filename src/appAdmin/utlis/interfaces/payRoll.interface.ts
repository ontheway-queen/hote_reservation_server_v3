export interface ICreatePayrollBody {
	hotel_code: number;
	employee_id: number;
	account_id: number;
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
}

export interface ICreatedeductionBody {
	payroll_id: number;
	amount: number;
	deduction_name: string;
	employee_id: number;
}

export interface ICreateAdditionBody {
	payroll_id: number;
	amount: number;
	allowance_id: number;
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
	employee_name: string;
	employee_designation: string;
	employee_phone: string;
	total_allowance: string;
	total_deduction: string;
	service_charge: string;
	total_overtime: string;
	base_salary: string;
	net_salary: string;
	salary_date: string;
	deductions: Deduction[];
	allowances: Allowance[];
}

export interface Deduction {
	id: number;
	amount: number;
	deduction_name: string;
}

export interface Allowance {
	id: number;
	amount: number;
	allowance_name: string;
}

export interface IPayrollList {
	id: number;
	employee_name: string;
	designation: string;
	total_allowance: string;
	total_deduction: string;
	service_charge: string;
	total_overtime: string;
	base_salary: string;
	net_salary: string;
	salary_date: string;
}
