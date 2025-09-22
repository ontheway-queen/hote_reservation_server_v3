export interface IGetServiceList {
	id: number;
	thumbnail_url: string;
	service_code: string;
	name: string;
	category_name: string;
	min_persons: number;
	max_persons: number;
	is_always_open: boolean;
	status: boolean;
}

export interface IGetSingleService {
	id: number;
	service_code: string;
	thumbnail_url: string;
	name: string;
	category_id: number;
	category_name: string;
	description: string;
	is_always_open: boolean;
	min_persons: number;
	max_persons: number;
	delivery_required: boolean;
	status: boolean;
	images: IImages[] | null;
	pricing_models: PricingModel[];
	service_schedule: ServiceSchedule[] | null;
}

export interface IImages {
	id: number;
	file: string;
}

export interface PricingModel {
	id: number;
	vat: number;
	price: number;
	discount: number;
	total_price: number;
	pricing_model: string;
	delivery_types: string;
	discount_price: number;
	delivery_charge: number;
	delivery_time_estimate: number;
}

export interface ServiceSchedule {
	id: number;
	day: string;
	open_time: string;
	close_time: string;
}
