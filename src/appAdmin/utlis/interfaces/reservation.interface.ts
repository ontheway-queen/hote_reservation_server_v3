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

type AvailableRatePlan = {
  rate_plan_id: number;
  name: string;
  base_rate: number;
};

export interface IAvailableRoomType {
  id: number;
  name: string;
  description: string | null;
  hotel_code: number;
  available_rooms: number;
  rate_plans: AvailableRatePlan[];
}

type CalendarBooking = {
  booking_id: number;
  check_in: string;
  check_out: string;
  booking_status: string;
  guest_id: number;
  guest_name: string;
  vat: number;
  service_charge: number;
  sub_total: number;
  discount_amount: number;
  total_amount: number;
};

type CalendarRoom = {
  room_id: number;
  room_name: string;
  room_status: string;
  bookings: CalendarBooking[];
};

export type CalendarRoomType = {
  id: number;
  name: string;
  hotel_code: number;
  rooms: CalendarRoom[];
};

//---------------------booking -------------------//
export interface IguestReqBody {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  nationality: string;
  country: string;
}

export interface BookingRequestBody {
  reservation_type: "hold" | "booked";
  check_in: string;
  is_checked_in: boolean;
  check_out: string;
  guest: IguestReqBody;
  pickup: boolean;
  pickup_from?: string;
  pickup_time?: string;
  drop: boolean;
  drop_to?: string;
  drop_time?: string;
  discount_amount: number;
  service_charge: number;
  is_company_booked: boolean;
  company_name?: string;
  visit_purpose?: string;
  vat: number;
  is_payment_given: boolean;
  rooms: RoomRequest[];
  special_requests?: string;
  payment: IbookingReqPayment;
  source_id: number;
}

export interface IbookingReqPayment {
  method: "MOBILE_BANKING" | "BANK" | "CASH";
  acc_id: number;
  amount: number;
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
  cbf: number; //breakfast coupon
}

export interface IRoomBooking {
  hotel_code: number;
  booking_reference: string;
  guest_id: number;
  created_by: number;
  total_nights: number;
  booking_date: string;
  check_in: string;
  check_out: string;
  booking_type: string;
  status: string;
  // sub_total: number;
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
  is_company_booked: boolean;
  company_name?: string;
  visit_purpose?: string;
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
  unit_base_rate: number;
  unit_changed_rate: number;
  cbf?: number; //breakfast coupon
}

// ------------------------ single booking ----------------------//

export interface BookingRoom {
  id: number;
  room_type_id: number;
  room_type_name: string;
  room_id: number;
  room_name: string;
  adults: number;
  children: number;
  infant: number;
  base_rate: number;
  changed_rate: number;
  unit_base_rate: number;
  unit_changed_rate: number;
}

interface BookingGuest {
  guest_id: number;
  first_name: string;
  last_name: string;
  guest_email: string;
  phone: string;
  address: string;
  country: string;
  passport_number: string;
  nationality: string;
}

export interface IBookingDetails extends BookingGuest {
  id: number;
  booking_reference: string;
  booking_date: string; // or Date if parsed
  check_in: string;
  check_out: string;
  booking_type: string;
  status: string;
  source_name: string | null;
  total_amount: number;
  vat: number;
  discount_amount: number;
  service_charge: number;
  payment_status: string;
  comments: string | null;
  pickup: boolean;
  pickup_from: string | null;
  pickup_time: string | null;
  drop: boolean;
  drop_time: string | null;
  drop_to: string | null;
  booking_rooms: BookingRoom[];
}

export interface addPaymentReqBody {
  folio_id: number;
  amount: number;
  payment_type: "MOBILE_BANKING" | "BANK" | "CASH";
  acc_id: number;
  payment_date: string;
  remarks: string;
}
