export interface IRestaurantAdminProfile {
	id: number;
	name: string;
	email: string;
	phone: string;
	photo: string;
	status: string;
	role_id: number;
	restaurant_id: number;
	restaurant_name: string;
	restaurant_photo: string;
	restaurant_email: string;
	restaurant_phone: string;
	restaurant_address: string;
	restaurant_city: string;
	restaurant_country: string;
	restaurant_bin_no: string;
	restaurant_status: string;
}

export interface IGetRestaurant {
	id: number;
	name: string;
	email: string;
	status: string;
	phone: string;
	photo: string;
	is_deleted: boolean;
}

export interface IGetRestaurantWithAdmin {
	id: number;
	photo: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	country: string;
	bin_no: string;
	status: string;
	is_deleted: boolean;
	admin_id: number;
	admin_name: string;
	admin_photo: string;
	admin_phone: string;
	admin_email: string;
	admin_status: string;
}
