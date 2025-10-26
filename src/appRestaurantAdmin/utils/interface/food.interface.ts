interface IreqFood {
  name: string;
  menu_category_id: number;
  unit_id: number;
  retail_price: number;
  serving_quantity?: number;
  linked_inventory_item_id?: number;
  photo?: string;
}

export interface IcreateFoodRequestPayload {
  food: IreqFood;
  recipe_type: "ingredients" | "non-ingredients" | "stock";
  ingredients?: { product_id: number; quantity_per_unit: number }[];
}
export interface IupdateFoodRequestPayload {
  food: IreqFood;
  recipe_type: "ingredients" | "non-ingredients" | "stock";
  ingredients?: { product_id: number; quantity_per_unit: number }[];
}

export interface IFoodRequest {
  name: string;
  menu_category_id: number;
  unit_id: number;
  retail_price: number;
  measurement_per_unit: number;
  photo?: string;
  food_receipe: IFoodReceipe[];
}

export interface IFoodReceipe {
  id: number;
  quantity_per_unit: number;
}

export interface IFoodPayload {
  hotel_code: number;
  restaurant_id: number;
  name: string;
  menu_category_id: number;
  unit_id: number;
  retail_price: number;
  serving_quantity?: number;
  photo?: string;
  created_by: number;
  linked_inventory_item_id?: number;
  recipe_type: "ingredients" | "non-ingredients" | "stock";
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
  recipe_type: "ingredients" | "non-ingredients" | "stock";
  linked_inventory_item_id: number | null;
}

export interface IFoodUpdatePayload {}

export interface IGetSingleFood {
  id: number;
  hotel_code: number;
  restaurant_id: number;
  photo: string;
  name: string;
  menu_category_id: number;
  menu_category_name: string;
  unit_id: number;
  unit_name: string;
  unit_short_code: string;
  retail_price: string;
  ingredients: Ingredient[];
  measurment_per_unit: number;
  recipe_type: "ingredients" | "non-ingredients" | "stock";
}

export interface Ingredient {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  unit_id: number;
  unit_name: string;
  unit_short_code: string;
  quantity_per_unit: number;
}

export interface StockItem {
  food_id: number;
  name: string;
  recipe_type: "stock" | "ingredient" | "non-ingredients";
  photo: string | null;
  available_stock: number;
  quantity_used: number;
  stock_date: string;
  wastage_quantity: string;
}
