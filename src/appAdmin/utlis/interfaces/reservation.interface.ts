type MealPlan = {
  id: number;
  meal_plan_item_id: number;
  meal_name: string;
  price: number;
};

type RatePlan = {
  rate_plan_id: number;
  room_type_id: number;
  base_rate: number;
  name: string;
  extra_adult_rate: number;
  base_includes_children: boolean;
  meal_plans: MealPlan[] | null;
};

type Bed = {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
  quantity: number;
  unit: string | null;
};

export interface IgetAccommodationSettings {
  id: number;
  has_child_rates: boolean;
  check_in_time: string;
  check_out_time: string;
}

export interface IgetChildRateGroups {
  id: number;
  rate_plan_id: number;
  age_from: number;
  age_to: number;
  rate_type: string;
  rate_value: string;
  room_type_id: number;
}

export interface ISearchAvailableRoom {
  room_type_id: number;
  room_type_name: string;
  base_occupancy: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  base_includes_children: boolean;
  available_rooms: number;
  min_base_rate: number;
  total_base_rate: number;
  extra_adult_rate: number;
  extra_child_rate: number;
  rate_plan_id: number;

  beds: {
    id: number;
    name: string;
    width: number;
    height: number;
    quantity: number;
    unit: string;
  }[];

  meal_plan_items: {
    meal_plan_item_id: number;
    meal_plan_name: string;
    price: number;
    vat: number;
    included: boolean;
  }[];
}

export interface IBookingRequest {
  booking_type: "single" | "group";
  check_in: string;
  check_out: string;
  booking_source: string;
  special_requests?: string;

  guest: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    nationality: string;
  };

  rooms: IBookingRoom[];
}

export interface IBookingRoom {
  room_type_id: number;
  rate_plan_id: number;
  number_of_rooms: number;

  guests: {
    adults: number;
    children: number;
  }[];

  cancellation_policy: {
    cancellation_policy_id: number;
    cancellation_policy_name: string;
    cancellation_policy_details: CancellationPolicyRule[];
  };

  meal_plans?: {
    meal_plan_item_id: number;
    meal_plan_name: string;
    included: boolean;
    price: number;
    vat: number;
  }[];

  rate_breakdown: {
    base_rate: number;
    extra_adult_charge: number;
    extra_child_charge: number;
    total_rate: number;
  }[];

  total_price: number;
}

export interface CancellationPolicyRule {
  fee_type: "fixed" | "percentage";
  fee_value: number;
  rule_type: "free" | "charge" | "no_show";
  days_before: number;
  cancellation_policy_id: number;
}

//---------------------booking -------------------//

export interface IRoomBooking {
  hotel_code: number;
  booking_reference: string;
  guest_id: number;
  created_by?: number;
  booking_date: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  number_of_nights: number;
  total_room?: number;
}
export interface IRoomBookingBody {
  name: string;
  email: string;
  phone: string;
  check_in_time: string;
  check_out_time: string;
  check_in: string;
  number_of_nights: number;
  total_occupancy: number;
  discount_amount: number;
  tax_amount: number;
  paid_amount: number;
  pay_status: number;
  ac_tr_ac_id: number;
  nid_no?: string;
  passport_no?: string;
  rooms: IbookingRooms;
  booking_rooms: IbookingRoomItem[];
  payment_type: "bank" | "cash" | "cheque" | "mobile-banking";
  extra_charge: number;
}

interface IbookingRoomItem {
  room_id: number;
  quantity: number;
}

export interface IBookingRooms {
  booking_id: number;
  room_id: number;
}

export interface IbookingRooms {
  id: number;
  room_id: number;
  bed_type: string;
  room_type: string;
  room_number: string;
}

export interface IsingleRoomBooking {
  id: number;
  hotel_code: number;
  user_id: number;
  name: string;
  photo: string;
  email: string;
  nid_no: string;
  passport_no: string;
  booking_no: string;
  check_in_time: string;
  check_out_time: string;
  number_of_nights: number;
  total_occupancy: number;
  grand_total: string;
  status: string;
  created_at: string;
  updated_at: string;
  booking_rooms: IbookingRooms[];
  extra_charge: number;
}

export interface IgetAllRoomBooking {
  id: number;
  hotel_code: number;
  user_id: number;
  name: string;
  photo: string;
  email: string;
  nid_no: string;
  passport_no: string;
  booking_no: string;
  pay_status: number;
  reserved_room: number;
  number_of_nights: number;
  total_occupancy: number;
  grand_total: string;
  status?: string;
  created_at: string;
  updated_at: string;
  booking_rooms: IbookingRooms[];
  extra_charge: number;
}

export interface IupdateManyRoomBooking {
  id?: number;
  hotel_code: number;
  user_id?: number;
  pay_status?: number;
  reserved_room?: number;
  booking_rooms?: IbookingRooms[];
}

export interface IrefundRoomBooking {
  hotel_code: number;
  pay_status: number;
  reserved_room: number;
  status: string;
}

export interface IupdateRoomBooking {
  email?: string;
  check_in_time?: string;
  check_out_time?: string;
  number_of_nights?: number;
  total_occupancy?: number;
  extend_status: number;
  total_extended_nights: number;
  grand_total?: number;
  created_by: number;
  rooms?: IbookingRooms;
  booking_rooms?: IbookingRoomItem[];
}

export interface IupdateRoomPayStatus {
  hotel_code: number;
  pay_status: number;
  reserved_room: number;
}
