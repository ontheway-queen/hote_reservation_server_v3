import { IStaff } from "../../../appRestaurantAdmin/utils/interface/staff.interface";

export interface ICreateRestaurantRequest {
  user: IRestaurantUserAdminRequest;
  restaurant: IRestaurantRequest;
  staffs: number[];
}

export interface IRestaurantRequest {
  name: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  bin_no?: bigint;
}

export interface IRestaurantUserAdminRequest {
  name: string;
  email: string;
  password: string;
  role: number;
  owner: boolean;
  phone?: string | null;
  photo?: string | null;
}

export interface IRestaurantPayload {
  head_id?: number;
  hotel_code: number;
  name: string;
  email: string;
  created_by: number;
  phone?: string | null;
  photo?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  bin_no?: bigint;
}

export interface IRestaurantUserAdminPayload {
  hotel_code: number;
  restaurant_id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  owner: boolean;
  created_by: number;
  phone?: string | null;
  photo?: string | null;
}

export interface IUpdateRestaurantPayload extends Partial<IRestaurantPayload> {
  status?: "active" | "inactive";
  updated_by?: number;
  head_id?: number;
}

export interface IUpdateRestaurantUserAdminPayload
  extends Partial<IRestaurantUserAdminPayload> {
  status?: "active" | "blocked";
}

export interface IGetRestaurantResponse {
  id: number;
  name: string;
  email: string;
  status: string;
  phone: string;
  photo: string;
  is_deleted: boolean;
}

export interface IGetSingleRestaurant {
  id: number;
  photo: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  bin_no: string;
  status: string;
  is_deleted: boolean;
  admin_id: number;
  admin_name: string;
  admin_photo: string;
  admin_phone: string;
  admin_email: string;
  admin_status: string;
  staffs: IStaff[];
}
