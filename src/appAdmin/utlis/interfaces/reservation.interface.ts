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

//---------------------booking -------------------//

export interface BookingRequestBody {
  reservation_type: "hold" | "confirm";
  check_in: string;
  is_checked_in: boolean;
  check_out: string;
  guest: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    nationality: string;
  };
  pickup: boolean;
  pickup_from?: string;
  pickup_time?: string;
  drop: boolean;
  drop_to?: string;
  drop_time?: string;
  discount_amount: number;
  service_charge: number;
  vat: number;
  rooms: RoomRequest[];
  special_requests?: string;
  payment: {
    method: "cash" | "card" | "online";
    acc_id: number;
    amount: number;
  };
  source_id: number;
}

export interface RoomRequest {
  room_type_id: number;
  rate_plan_id: number;
  rate: {
    base_price: number;
    changed_price: number;
  };
  number_of_rooms: number;
  guests: RoomGuest[];
  meal_plans_ids?: number[];
}

export interface RoomGuest {
  room_id: number;
  adults: number;
  children: number;
  infant: number;
}

export interface IRoomBooking {
  hotel_code: number;
  booking_reference: string;
  guest_id: number;
  created_by: number;
  booking_date: string;
  check_in: string;
  check_out: string;
  status: string;
  sub_total: number;
  total_amount: number;
  vat: number;
  service_charge: number;
  discount_amount: number;
  pickup: boolean;
  pickup_from?: string;
  pickup_time?: string;
  drop: boolean;
  drop_to?: string;
  drop_time?: string;
  comments?: string;
  source_id: number;
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

export interface IbookingRooms {
  booking_id: number;
  room_id: number;
  room_type_id: number;
  adults: number;
  children: number;
  infant: number;
  changed_rate: number;
  base_rate: number;
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
