import { ILimitSkip } from "../../../common/types/commontypes";

// create hotel user
export interface ICreateHotelPayload {
  name: string;
  hotel_code: number;
  description?: string;
  accommodation_type_id: number;
  accommodation_type_name: string;
  address?: string;
  postal_code?: string;
  chain_name?: string;
  star_category: number;
  city_code: number;
  latitude: string;
  longitude: string;
  country_code: string;
  expiry_date: Date;
}

export interface IUpdateHotelPayload {
  name: string;
  hotel_code: number;
  description?: string;
  accommodation_type_id: number;
  accommodation_type_name: string;
  address?: string;
  postal_code?: string;
  chain_name?: string;
  star_category: number;
  city_code: number;
  latitude: string;
  longitude: string;
  country_code: string;
  expiry_date: Date;
}

export interface IinsertHotelsCDPayload {
  phone: string;
  fax: string;
  website_url: string;
  email: string;
  logo: string;
  hotel_code: number;
}

export interface ICreateHotelUserPayload {
  name: string;
  hotel_code: string;
  phone?: string;
  email: string;
  photo?: string;
  role: number;
}

export interface IgetAllHotelUserPayload extends ILimitSkip {
  name?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  city?: string;
  group?: string;
}

export interface IsingleHotelUserPayload {
  email?: string;
  id?: number;
}

export interface IupdateHotelUser {
  name?: string;
  logo?: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  map_url?: string;
  website?: string;
  description?: string;
  founded_year?: string;
  zip_code?: string;
  postal_code?: string;
  email?: string;
  expiry_date?: Date;
  password?: string;
  group?: string;
  web_token?: string;
}
