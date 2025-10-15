export interface getAllStaffsResponse {
	data: IStaff[];
	total: number;
}

export interface IStaff {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	employee_id: number;
	employee_name: string;
	employee_photo: string;
	employee_email: string;
	employee_contact_no: string;
	employee_status: boolean;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
}

export interface IGetSingleStaffResponse {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	employee_id: number;
	employee_name: string;
	employee_photo: string;
	employee_email: string;
	employee_contact_no: string;
	employee_dob: string;
	employee_appointment_date: string;
	employee_joining_date: string;
	employee_address: string;
	blood_group_name: string;
	employee_status: boolean;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
}
