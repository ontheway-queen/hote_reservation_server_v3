export interface IguestInterface {
  hotel_code: number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  nationality?: string;
  passport_no?: string;
  nid_no?: string;
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

export default IguestInterface;
