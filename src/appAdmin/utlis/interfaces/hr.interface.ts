export interface IcreateEmployeeReqBody {
  name: string;
  photo?: string;
  department_ids: number[];
  designation_id: number;
  blood_group?: string;
  salary: number;
  email?: string;
  contact_no: string;
  dob?: string;
  appointment_date?: string;
  joining_date?: string;
  address?: string;
  created_by?: number;
}

export interface IcreateEmployee {
  hotel_code: number;
  name: string;
  photo?: string;
  designation_id: number;
  blood_group?: string;
  salary: number;
  email?: string;
  contact_no: string;
  dob?: string;
  appointment_date?: string;
  joining_date?: string;
  address?: string;
  created_by: number;
}

export interface IupdateEmployee {
  name: string;
  email: string;
  photo?: string;
  department_id: number;
  designation_id: number;
  salary: number;
  mobile_no: string;
  dob?: string;
  appointment_date?: string;
  joining_date?: string;
  address?: string;
  status?: boolean;
  blood_group?: string;
}

export interface IEmployeeListResponse {
  id: number;
  name: string;
  email: string;
  mobile_no: string;
  department: string;
  designation: string;
  salary: string;
  joining_date: Date;
  status: boolean;
}

export interface IEmployeeResponse {
  id: number;
  name: string;
  email: string;
  mobile_no: string;
  photo: string;
  blood_group_id: number;
  blood_group_name: string;
  department_id: number;
  department_name: string;
  designation_id: number;
  designation_name: string;
  salary: string;
  dob: Date;
  appointment_date: Date;
  joining_date: Date;
  hotel_code: number;
  hotel_name: string;
  created_by_id: number;
  created_by_name: string;
  address: string;
  status: boolean;
  created_at: Date;
  is_deleted: boolean;
}
