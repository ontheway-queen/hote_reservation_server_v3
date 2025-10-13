export interface IFoodRequest {
  name: string;
  menu_category_id: number;
  unit_id: number;
  retail_price: number;
  measurement_per_unit: number;
  photo?: string;
}

export interface IFoodPayload {
  hotel_code: number;
  restaurant_id: number;
  name: string;
  menu_category_id: number;
  unit_id: number;
  retail_price: number;
  measurement_per_unit: number;
  photo?: string;
  created_by: number;
}

export interface IGetFoods {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  name: string;
  menu_category_name: string;
  created_by_id: number;
  unit_name: string;
  unit_short_code: string;
  created_by_name: string;
  status: string;
  retail_price: string;
  is_deleted: boolean;
}

export interface IFoodUpdatePayload {}
