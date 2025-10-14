export interface IguestInterface {
  title?: "Mr." | "Ms." | "Mrs." | "Mstr.";
  hotel_code: number;
  country_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  passport_no?: string;
  nid_no?: string;
  type?: "adult" | "child" | "infant";
}

export interface IuserTypeInterface {
  user_id?: number;
  user_type: "guest" | "user" | "room-guest" | "hall-guest" | "res-guest";
}

export interface IuserPayload {
  hotel_code: number;
  name: string;
  email: string;
  city?: string;
  country?: string;
  phone?: number;
  address?: string;
  postal_code?: number;
  passport_no?: string;
  nid_no?: string;
  user_type: "guest" | "user" | "room-guest" | "hall-guest" | "res-guest";
}

export interface IgetSingleGuest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  passport_no: string;
  country_code: number;
  country_id: number;
  is_active: boolean;
}
