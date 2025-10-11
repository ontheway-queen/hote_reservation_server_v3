export interface ICreateRestaurantRequest {
	user: IRestaurantUserAdminRequest;
	restaurant: IRestaurantRequest;
}

export interface IRestaurantRequest {
	name: string;
	email: string;
	phone?: string | null;
	photo?: string | null;
	address?: string | null;
	city?: string | null;
	country?: string | null;
	bin_no?: bigint;
}

export interface IRestaurantUserAdminRequest {
	name: string;
	email: string;
	password: string;
	role: number;
	owner: boolean;
	phone?: string | null;
	photo?: string | null;
}

export interface IRestaurantPayload {
	hotel_code: number;
	name: string;
	email: string;
	created_by: number;
	phone?: string | null;
	photo?: string | null;
	address?: string | null;
	city?: string | null;
	country?: string | null;
	bin_no?: bigint;
}

export interface IRestaurantUserAdminPayload {
	hotel_code: number;
	restaurant_id: number;
	name: string;
	email: string;
	password: string;
	role_id: number;
	owner: boolean;
	created_by: number;
	phone?: string | null;
	photo?: string | null;
}

export interface IUpdateRestaurantPayload extends Partial<IRestaurantPayload> {
	status?: "active" | "inactive";
	updated_by?: number;
}

export interface IUpdateRestaurantUserAdminPayload
	extends Partial<IRestaurantUserAdminPayload> {
	status?: "active" | "blocked";
}
