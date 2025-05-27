export interface ICreateRestaurantPayload {
  hotel_code: number;
  name: string;
  email: string;
  phone: number;
  created_by: number;
}

export interface ICreateResAdminPayload {
  hotel_code: number;
  res_id: number;
  name: string;
  email: string;
  password: string;
  created_by: number;
}

export interface IupdateResAdminPayload {
  hotel_code: number;
  status: number;
  updated_by: number;
}
