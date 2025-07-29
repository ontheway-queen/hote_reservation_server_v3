export interface ImCreateRoomTypePayload {
  room_type: string;
}

export interface ImUpdateRoomTypePayload {
  room_type: string;
  status: number;
}

export interface ImCreateBedTypePayload {
  bed_type: string;
}

export interface ImUpdateBedTypePayload {
  bed_type: string;
  status: number;
}

export interface ImCreateRoomAmenitiesPayload {
  room_amenities: string;
}

export interface ImUpdateRoomAmenitiesPayload {
  room_amenities: string;
  status: number;
}

export interface ImCreatedesignation {
  name: string;
}

export interface ImUpdatedesignation {
  name: string;
  status: number;
}

export interface ImCreatedepartment {
  name: string;
}

export interface ImUpdatedepartment {
  name: string;
  status: number;
}

export interface ImCreateHallAmenitiesPayload {
  name: string;
  description?: string | null;
}

export interface ImUpdateHallAmenitiesPayload {
  name: string;
  description?: string | null;
  status: number;
}

export interface ImCreateCategoryPayload {
  name: string;
  created_by: number;
}

export interface ImUpdateCategoryPayload {
  name: string;
  status: number;
  updated_by: number;
}

export interface ImCreateUnitPayload {
  name: string;
  created_by: number;
}

export interface ImUpdateUnitPayload {
  name: string;
  status: number;
  updated_by: number;
}

export interface ImCreateBrandPayload {
  name: string;
  created_by: number;
}

export interface ImUpdateBrandPayload {
  name: string;
  status: number;
  updated_by: number;
}

export interface IhotelCreateRequestBodyPayload {
  hotel_name: string;
  hotel_email: string;
  description: string;
  accommodation_type_id: number;
  chain_name: string;
  latitude: string;
  longitude: string;
  star_category: number;
  postal_code: string;
  address: string;
  password: string;
  city_code: number;
  country_code: string;
  expiry_date: Date;
  user_name: string;
  fax: string;
  phone: string;
  website_url: string;
  permission?: string;
}
export interface IUpdateHotelReqBody {
  hotel_name: string;
  expiry_date: string | Date;
  status: boolean;
  hotel_email: string;
  description: string;
  accommodation_type_id: number;
  chain_name: string;
  latitude: string;
  longitude: string;
  star_category: number;
  postal_code: number;
  address: string;
  city_code: number;
  country_code: string;
  website_url: string;
  phone: string;
  optional_phone1: string;
  fax: string;
  bin: string;
  remove_hotel_images: number[];
}

interface IHotelImage {
  id: number;
  image_url: string;
  image_caption: string | null;
  main_image: boolean;
}

export interface ISingleHotel {
  id: number;
  hotel_code: number;
  hotel_name: string;
  address: string | null;
  star_category: number | null;
  city_code: string | null;
  country_code: string | null;
  accommodation_type_id: number | null;
  accommodation_type_name: string | null;
  created_at: string; // or Date if you cast later
  latitude: number | null;
  longitude: number | null;
  chain_name: string | null;
  postal_code: string | null;
  description: string | null;
  status: string;
  expiry_date: string | null; // or Date
  logo: string | null;
  fax: string | null;
  website_url: string | null;
  hotel_email: string | null;
  phone: string | null;
  optional_phone1: string | null;
  bin: string | null;
  images: IHotelImage[] | null; // json_agg can be null if no rows
}
