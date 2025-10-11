export interface IRestaurantMenuCategoryPayload {
	hotel_code: number;
	restaurant_id: number;
	name: string;
	created_by: number;
}

export interface IGetRestaurantMenuCategories {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	name: string;
	status: string;
	is_deleted: boolean;
	created_by: number;
	created_by_name: string;
}

export interface IUpdateRestaurantMenuCategoryPayload {
	name?: string;
	status?: string;
}
