export interface ICreateTableRequest {
	name: string;
	category: string;
}

export interface IRestaurantTablePayload {
	hotel_code: number;
	restaurant_id: number;
	name: string;
	category: string;
	created_by: number;
}

export interface IGetRestaurantTables {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	name: string;
	category: string;
	status: string;
	is_deleted: boolean;
}

export interface IUpdateRestaurantTablePayload
	extends Partial<IRestaurantTablePayload> {
	status?: string;
	updated_by?: number;
}
