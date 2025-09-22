export interface IGetServiceCategory {
	id: number;
	hotel_code: number;
	name: string;
	status: boolean;
	created_by: number;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
}

export interface IGetServiceCategories {
	id: number;
	hotel_code: number;
	name: string;
	status: boolean;
	created_by: string;
	is_deleted: boolean;
	created_at: string;
	service_count: number;
}
