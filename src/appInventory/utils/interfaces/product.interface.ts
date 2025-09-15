export interface ICreateProductPayload {
	hotel_code?: number;
	product_code: string;
	name: string;
	model: string;
	category_id: number;
	unit_id: number;
	brand_id: number;
	details: string;
	image: string;
	created_by: number;
}

export interface IupdateProductPayload {
	name?: string;
	model?: string;
	category_id?: number;
	unit_id?: number;
	brand_id?: number;
	details?: string;
	image?: string;
}

export interface ICreateDemagedProductBody {
	hotel_code: number;
	date: Date;
}

export interface ICreateDemagedProductPayload {
	date: Date;
	hotel_code: number;
	product_id: number;
	quantity: number;
	created_by: number;
	note: string;
}

export interface IdamageItems {
	product_id: number;
	quantity: number;
	note: string;
}

export interface ICreateDamagedProductBody {
	date: Date;
	damaged_items: IdamageItems[];
}
