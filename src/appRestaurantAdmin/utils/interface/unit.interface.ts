export interface IUnitRequest {
	name: string;
	short_code: string;
}

export interface IUnitPayload {
	hotel_code: number;
	restaurant_id: number;
	name: string;
	short_code: string;
	created_by: number;
}

export interface IGetUnit {
	id: number;
	hotel_code: number;
	restaurant_id: number;
	name: string;
	short_code: string;
	is_deleted: boolean;
}

export interface IUpdateUnitRequest extends Partial<IUnitRequest> {}

export interface IUpdateUnitPayload extends Partial<IUnitPayload> {}
