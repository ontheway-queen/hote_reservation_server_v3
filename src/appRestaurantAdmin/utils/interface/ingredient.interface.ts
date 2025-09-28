export interface IIngredientRequest {
	name: string;
	measurement_id: number;
}

export interface IIngredientPayload {
	restaurant_id: number;
	hotel_code: number;
	name: string;
	measurement_id: number;
	created_by: number;
}

export interface IGetIngredients {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	name: string;
	measurement_name: string;
	measurement_short_code: string;
	created_by_id: number;
	created_by_name: string;
	is_deleted: boolean;
}

export interface IUpdateIngredientPayload {
	name?: string;
	measurement_id?: number;
}
