export interface IMeasurementRequest {
	name: string;
	short_code: string;
}

export interface IMeasurementPayload {
	hotel_code: number;
	restaurant_id: number;
	name: string;
	short_code: string;
	created_by: number;
}

export interface IUpdateMeasurementRequest
	extends Partial<IMeasurementRequest> {}

export interface IUpdateMeasurementPayload
	extends Partial<IMeasurementPayload> {}
