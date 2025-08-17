export interface ISiteConfigPayload {
	main_logo?: string;
	contact_us_thumbnail?: string;
	about_us_thumbnail?: string;
	favicon?: string;
	site_thumbnail?: string;
	hero_quote?: string;
	hero_sub_quote?: string;
	site_name?: string;
	emails?: string;
	numbers?: string;
	address?: string;
	contact_us_content?: string;
	about_us_content?: string;
	privacy_policy_content?: string;
	term_and_conditions_content?: string;
	meta_title?: string;
	meta_description?: string;
	meta_tags?: string;
	notice?: string;
	android_app_link?: string;
	ios_app_link?: string;
}

export interface ISiteConfig {
	id: number;
	hotel_code: number;
	main_logo: string;
	hero_quote: string;
	hero_sub_quote: string;
	site_name: string;
	emails: Email[];
	numbers: Number[];
	address: Address[];
	contact_us_content: string;
	contact_us_thumbnail: string;
	about_us_content: string;
	about_us_thumbnail: string;
	privacy_policy_content: string;
	terms_and_conditions_content: string;
	last_updated: string;
	updated_by: number;
	meta_title: string;
	meta_description: string;
	meta_tags: string;
	notice: string;
	android_app_link: string;
	ios_app_link: string;
	favicon: string;
	site_thumbnail: string;
}

export interface Email {
	email: string;
}

export interface Number {
	number: string;
}

export interface Address {
	title?: string;
	address?: string;
}

export interface IPopUpBanner {
	id: number;
	hotel_code: number;
	title: string;
	thumbnail: string;
	description: string;
	status: boolean;
	link: string;
	created_at: string;
	updated_at: string;
}

export interface IPopUpBannerPayload {
	title?: string;
	thumbnail?: string;
	description?: string;
	status?: boolean;
	link?: string;
	updated_at?: Date;
}

export interface IHeroBgContent {
	id: number;
	hotel_code: number;
	type: string;
	content: string;
	status: boolean;
	order_number: number;
	quote: string;
	sub_quote: string;
	tab: string;
}

export interface IHeroBgContentPayload {
	type?: string;
	content?: string;
	status?: boolean;
	order_number?: number;
	quote?: string;
	sub_quote?: string;
	tab?: string;
}

export interface IGetHotDeals {
	id: number;
	hotel_code: number;
	title: string;
	thumbnail: string;
	link: string;
	status: boolean;
	order_number: number;
}

export interface IHotDealsPayload {
	title: string;
	thumbnail: string;
	link: string;
	status: boolean;
	order_number: number;
}
