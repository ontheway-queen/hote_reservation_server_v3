import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
  FUNCTION_TYPE_HOTEL,
} from "../../../utils/miscellaneous/constants";

export interface ICreateAgencyB2CHeroBgContentPayload {
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  hotel_code: number;
  order_number: number;
  content: string;
  quote?: string;
  sub_quote?: string;
  tab?: typeof FUNCTION_TYPE_HOTEL;
}

export interface IUpdateAgencyB2CHeroBgContentPayload {
  order_number?: number;
  type?: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  content?: string;
  quote?: string;
  sub_quote?: string;
  tab?: typeof FUNCTION_TYPE_HOTEL;
}

export interface IGetAgencyB2CHeroBgContentQuery {
  agency_id: number;
  status?: boolean;
  type?: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
}

export interface IGetAgencyB2CHeroBgContentData {
  id: number;
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  agency_id: number;
  order_number: number;
  content: string;
  status: boolean;
}

export interface ICreateAgencyB2CPopularDestinationPayload {
  agency_id: number;
  thumbnail: string;
  order_number: number;
  from_airport: number;
  to_airport: number;
}
export interface IUpdateAgencyB2CPopularDestinationPayload {
  thumbnail?: string;
  order_number?: number;
  from_airport?: number;
  to_airport?: number;
}

export interface IGetAgencyB2CPopularDestinationQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CPopularDestinationData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  from_airport: number;
  from_airport_name: string;
  from_airport_country: string;
  from_airport_city: string;
  from_airport_code: string;
  to_airport: number;
  to_airport_name: string;
  to_airport_country: string;
  to_airport_city: string;
  to_airport_code: string;
  status: boolean;
}

export interface IGetAgencyB2CPopularDestinationLastNoData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  country_id: number;
  from_airport: number;
  to_airport: number;
  status: boolean;
}

export interface ICreateAgencyB2CPopularPlace {
  agency_id: number;
  thumbnail: string;
  order_number: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_id?: number;
}

export interface IGetAgencyB2CPopularPlaceQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CPopularPlaceData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_name: string;
  country_id?: number;
  status: boolean;
}

export interface IUpdateAgencyB2CPopularPlace {
  thumbnail?: string;
  order_number?: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_id?: number;
  status?: boolean;
}

export interface ICreateHotelB2CSiteConfig {
  agency_id: number;
  main_logo?: string;
  favicon?: string;
  site_thumbnail?: string;
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: string; // Replace `any` with a defined structure if known
  numbers?: string;
  address?: string;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated?: Date;
  updated_by?: number;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface IGetHotelB2CSiteConfigData {
  id: number;
  hotel_code: number;
  main_logo: string;
  favicon: string;
  site_thumbnail: string;
  hero_quote: string;
  hero_sub_quote: string;
  site_name: string;
  emails: string;
  numbers: string;
  address: string;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated?: Date;
  updated_by?: number;
  updated_by_name?: string;
  android_app_link?: string;
  ios_app_link?: string;
  show_developer: boolean;
  developer_name: string;
  developer_link: string;
}

export interface IB2CSubUpdateSiteConfigReqBody {
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: { email: string }[];
  numbers?: { number: string }[];
  address?: { title: string; address: string }[];
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  android_app_link?: string;
  ios_app_link?: string;
  show_developer?: boolean;
  developer_name?: string;
  developer_link?: string;
}

export interface IUpdateHotelB2CSiteConfigPayload {
  main_logo?: string;
  favicon?: string;
  site_thumbnail?: string;
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: string;
  numbers?: string;
  address?: string;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated: Date;
  updated_by: number;
  android_app_link?: string;
  ios_app_link?: string;
  show_developer?: boolean;
  developer_name?: string;
  developer_link?: string;
}

export interface ICreateHotelB2CSocialLinkPayload {
  hotel_code: number;
  social_media_id: number;
  link: string;
  order_number: number;
}

export interface IGetAgencyB2CSocialLinkQuery {
  hotel_code: number;
  status?: boolean;
}

export interface IGetAgencyB2CSocialLinkData {
  id: number;
  media: string;
  link: string;
  order_number: number;
  social_media_id: number;
  logo: string;
  status: boolean;
}

export interface IGetSocialMediaData {
  id: number;
  name: string;
  logo: string;
  status: boolean;
}

export interface IUpdateAgencyB2CSocialLinkPayload {
  social_media_id?: number;
  link?: string;
  order_number?: number;
  status?: boolean;
}

export interface ICreateAgencyB2CHotDeals {
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  order_number: number;
}

export interface IGetAgencyB2CHotDealsQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CHotDealsData {
  id: number;
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  order_number: number;
  status: boolean;
}

export interface IUpdateAgencyB2CHotDealsPayload {
  title?: string;
  thumbnail?: string;
  link?: string;
  order_number?: number;
  status?: boolean;
}

export interface ICreateAgencyB2CPopUpBanner {
  hotel_code: number;
  title?: string;
  thumbnail?: string;
  link?: string;
  description?: string;
  pop_up_for?: "WEB";
}

export interface IGetAgencyB2CPopUpBannerQuery {
  hotel_code: number;
  status?: boolean;
  pop_up_for?: "WEB";
}

export interface IGetAgencyB2CPopUpBannerData {
  id: number;
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  description: string;
  pop_up_for?: "WEB";
  status: boolean;
}

export interface IUpdateAgencyB2CPopUpBannerPayload {
  title?: string;
  thumbnail?: string;
  link?: string;
  description?: string;
  status?: boolean;
}

export interface IInsertSocialMedia {
  name: string;
  logo: string;
}
export interface IUpdateSocialMediaPayload {
  name?: string;
  logo?: string;
  status?: boolean;
}
export interface IGetSocialMediaData {
  id: number;
  name: string;
  logo: string;
  status: boolean;
}

export interface IUpSertPopUpBannerReqBody {
  title?: string;
  pop_up_for: "WEB";
  status?: boolean;
  description?: string;
  link?: string;
}
