export interface ICreateTableRequest {
  name: string;
  floor_id: number;
  capacity: number;
}

export interface IRestaurantTablePayload {
  hotel_code: number;
  restaurant_id: number;
  name: string;
  floor_id: number;
  capacity: number;
  created_by: number;
}

export interface IGetRestaurantTables {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  name: string;
  category: string;
  status: string;
  is_deleted: boolean;
}

export interface IUpdateRestaurantTablePayload
  extends Partial<IRestaurantTablePayload> {
  status?: string;
  updated_by?: number;
}
