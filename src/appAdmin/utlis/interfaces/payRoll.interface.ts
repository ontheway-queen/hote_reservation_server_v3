export interface ICreatePayrollBody {
	hotel_code: number;
	voucher_no?: number;
	employee_id: number;
	attendance_days: number;
	working_hours: number;
	ac_tr_ac_id: number;
	gross_salary: number;
	advance_salary: number | null;
	provident_fund: number | null;
	mobile_bill: number | null;
	feed_allowance: number | null;
	perform_bonus: number | null;
	festival_bonus: string | null;
	travel_allowance: string | null;
	health_allowance: string | null;
	incentive: string | null;
	house_rent: string | null;
	salary_date: string;
	total_salary: number;
	docs: string | null;
	note: string | null;
}

export interface ICreatedeductionBody {
	payroll_id: number;
	deduction_amount: number;
	deduction_reason: string;
}

export interface ICreateAdditionBody {
	payroll_id: number;
	hours: number;
	other_amount: number;
	other_details: string;
}

export interface ISinglePayroll {
	id: number;
	voucher_no: string;
	ac_type: string;
	account_name: string;
	branch_name: string;
	hotel_name: string;
	hotel_address: string;
	country_code: string;
	city_code: number;
	postal_code: any;
	employee_name: string;
	employee_designation: string;
	employee_phone: string;
	attendance_days: number;
	working_hours: number;
	advance_salary: string;
	gross_salary: string;
	provident_fund: string;
	mobile_bill: string;
	feed_allowance: string;
	perform_bonus: string;
	festival_bonus: string;
	travel_allowance: string;
	health_allowance: string;
	incentive: string;
	salary_date: string;
	house_rent: string;
	total_salary: string;
	deductions: Deduction[];
	additions: Addition[];
}

export interface Deduction {
	id: number;
	deduction_amount: number;
	deduction_reason: string;
}

export interface Addition {
	id: number;
	other_amount: number;
	other_details: string;
}

export interface IPayrollList {
	id: number;
	voucher_no: string;
	employee_name: string;
	designation: string;
	pay_method: string;
	account_name: string;
	base_salary: string;
	attendance_days: number;
	working_hours: number;
	gross_salary: string;
	total_salary: string;
	salary_date: string;
}
