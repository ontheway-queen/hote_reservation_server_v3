export interface ICreateRoomTypePayload {
  hotel_code: number;
  name: string;
  description: string;
  categories_type_id: number;
  area: number;
  room_info: string;
}
export interface ICreateRoomTypeBodyPayload {
  name: string;
  description: string;
  categories_type_id: number;
  base_occupancy: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  bed_count: number;
  area: number;
  room_info: string;
  rt_amenities: string;
  beds: {
    bed_type_id: number;
    quantity: number;
  }[];
}

export interface IUpdateRoomTypeBodyPayload {
  name: string;
  description: string;
  categories_type_id: number;
  base_occupancy: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  bed_count: number;
  area: number;
  room_info: string;
  rt_amenities: string;
  beds: {
    bed_type_id: number;
    quantity: number;
  }[];
  remove_photos: number[];
  remove_beds: number[];
}

export interface IUpdateRoomTypePayload {
  name: string;
  description: string;
  categories_type_id: number;
  base_occupancy: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  bed_count: number;
  area: number;
  room_info: string;
}

export interface ICreateBedTypePayload {
  hotel_code: number;
  bed_type: string;
}

export interface IUpdateBedTypePayload {
  name: string;
  status: boolean;
  width: number;
  height: number;
  is_deleted: boolean;
}

export interface ICreateBankNamePayload {
  hotel_code: number;
  name: string;
}

export interface IUpdateBankName {
  name: string;
}

export interface ICreatedesignation {
  hotel_code: number;
  name: string;
}

export interface IUpdatedesignation {
  name: string;
  status: number;
}

export interface ICreatedepartment {
  hotel_code: number;
  name: string;
}

export interface IUpdatedepartment {
  name: string;
  status: string;
}

export interface ICreateHallAmenitiesPayload {
  hotel_code: number;
  name: string;
  description?: string;
}

export interface IUpdateHallAmenitiesPayload {
  name: string;
  description?: string;
  status: number;
}

export interface ICreatePayrollMonths {
  hotel_code: number;
  name: string;
  days: number;
  hours: number;
}

export interface IUpdatePayrollMonths {
  name: string;
  days: number;
  hours: number;
}

export interface IAccomodationReqBodyPayload {
  check_in_time: string;
  check_out_time: string;

  child_age_policies?: {
    age_from: number;
    age_to: number;
    charge_type: "free" | "fixed" | "percentage" | "same_as_adult";
    charge_value: number;
  }[];
}
export interface IAccomodationUpdateReqBodyPayload {
  check_in_time: string;
  check_out_time: string;
  add_child_age_policies?: {
    age_from: number;
    age_to: number;
    charge_value: number;
    charge_type: "free" | "fixed" | "percentage" | "same_as_adult";
  }[];
  remove_child_age_policies: number[];
}

export interface IcancellationPolicyReqBodyPayload {
  policy_name: string;
  description: string;
  rules: {
    days_before: number;
    rule_type: "free" | "charge" | "no_show";
    fee_type: "fixed" | "percentage";
    fee_value: number;
  }[];
}

export interface IUpdatecancellationPolicyReqBodyPayload {
  policy_name: string;
  description: string;
  status: boolean;
  add_rules: {
    days_before: number;
    rule_type: "free" | "charge" | "no_show";
    fee_type: "fixed" | "percentage";
    fee_value: number;
  }[];
  remove_rules: number[];
}

export interface IRoomRateReqBodyPayload {
  name: string;
  cancellation_policy_id: number;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
  currency?: string; // Optional, but recommended (e.g., "USD")
  sources: number[]; // Source/channel IDs (e.g., OTAs)
  meal_plan_items: number[]; // IDs from meal_plan_items (not meal_plans)
  room_type_prices: RoomTypePrice[];
}

interface RoomTypePrice {
  room_type_id: number;
  base_rate: number;
  extra_adult_rate?: number;
  extra_child_rate?: number;
  child_rate_groups: {
    age_from: number;
    age_to: number;
    rate_type: "free" | "fixed" | "percentage" | "same_as_adult";
    rate_value: number;
  }[];
  specific_dates?: SpecificDateRate[];
}

interface SpecificDateRate {
  date: string[];
  type: "for_all_specific_day" | "specific_day";
  rate: number;
  extra_adult_rate?: number;
  extra_child_rate?: number;
}

interface IMealItem {
  meal_plan_id: number;
  price: number;
  vat: number;
}

export interface IRoomMealOption {
  is_possible_book_meal_opt_with_room: boolean;
  add_meal_items: IMealItem[];
  update_meal_items: IMealItem[];
  remove_meal_items: number[];
}
export interface IUpdateRoomMealOption {
  is_possible_book_meal_opt_with_room: string;
  add_meal_items: IMealItem[];
  remove_meal_items: number[];
}
