export interface IBtocUserRegistration {
	hotel_code: number;
	first_name: string;
	last_name: string;
	email: string;
	password?: string;
	phone?: string;
	photo?: string;
	date_of_birth?: string;
	gender?: string;
	address?: string;
	city_id?: number;
	country_id?: number;
}

export interface IBtocUser {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone: string;
	photo: string;
	date_of_birth: string;
	gender: string;
	address: string;
	city_id: number;
	country_id: number;
	status: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
}

export interface IBtocUserProfile {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	photo: string | null;
	status: string;
	password: string;
	gender: string;
	address: string;
	date_of_birth: string;
	city: string | null;
	country: string | null;
	is_deleted: boolean;
}
