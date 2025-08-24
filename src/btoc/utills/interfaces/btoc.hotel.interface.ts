export interface hotelSearchAvailabilityReqPayload {
  client_nationality: string;
  checkin: string;
  checkout: string;
  rooms: {
    adults: number;
    children_ages: number[];
  }[];
}

export interface recheckReqPayload {
  checkin: string;
  checkout: string;
  room_type_id: number;
  rate_plan_id: number;

  rooms: {
    adults: number;
    children_ages: number[];
  }[];
}

export interface ISearchAvailableRoomsPayload {
  checkin: string;
  checkout: string;
  hotel_code: number;
  nights: number;
  rooms: {
    adults: number;
    children_ages: number[];
  }[];
}

export interface IAvailableRoomType {
  room_type_id: number;
  room_type_name: string;
  description: string | null;
  max_adults: number;
  max_children: number;
  available_count: number;
  rate_plan_id: number;
  rate_plan_name: string;
  base_rate: number;
  boarding_details: string[];
}

export interface IMinRoomRatePlan {
  rate_plan_id: number;
  rate_plan_name: string;
  boarding_details: string[];
  price: number;
  no_of_rooms: number;
  rooms: {
    no_of_adults: number;
    no_of_children: number;
    no_of_rooms: number;
    description: string;
    room_type: string;
  }[];
  cancellation_policy: Record<string, any>;
}

export interface IGroupedRoomType {
  room_type_id: number;
  room_type_name: string;
  description: string;
  max_adults: number;
  max_children: number;
  available_count: number;
  rate_plans: {
    rate_plan_id: number;
    rate_plan_name: string;
    boarding_details: string[];
    base_rate: number;
  }[];
  min_rate?: IMinRoomRatePlan;
}

export interface IAvailableRoomSearchRes {
  room_type_id: number;
  room_type_name: string;
  description: string;
  max_adults: number;
  max_children: number;
  available_count: number;
  min_rate: IMinRoomRatePlan;
}

export interface IRoomRatesRes {
  room_type_id: number;
  room_type_name: string;
  description: string;
  max_adults: number;
  max_children: number;
  available_count: number;
  price: number;
  room_rates: {
    rate_plan_id: number;
    rate_plan_name: string;
    boarding_details: string[];
    base_rate: number;
    total_price: number;
    no_of_rooms: number;
    rooms: {
      no_of_adults: number;
      no_of_children: number;
      no_of_rooms: number;
      description: string;
      room_type: string;
    }[];
    cancellation_policy: {};
  }[];
}
export interface IRecheckRes {
  room_type_id: number;
  room_type_name: string;
  description: string;
  max_adults: number;
  max_children: number;
  available_count: number;
  price: number;
  rate: {
    rate_plan_id: number;
    rate_plan_name: string;
    boarding_details: string[];
    base_rate: number;
    total_price: number;
    no_of_rooms: number;
    rooms: {
      no_of_adults: number;
      no_of_children: number;
      no_of_rooms: number;
      description: string;
      room_type: string;
    }[];
    cancellation_policy: {};
  };
}

export interface IPax {
  type: "AD" | "CH";
  title: "Mr." | "Ms." | "Mrs." | "Mstr.";
  name: string;
  surname: string;
}

export interface IRoom {
  adults: number;
  children_ages: number[];
  paxes?: IPax[];
}

export interface IHolder {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
}

export interface IBookingRequestBody {
  checkin: string;
  checkout: string;
  room_type_id: number;
  rate_plan_id: number;
  rooms: IRoom[];
  special_requests?: string;
  holder: IHolder;
}

export interface IBookedRoomTypeRequest {
  room_type_id: number;
  rate_plan_id: number;
  rooms: IBRoomGuest[];
  meal_plans_ids?: number[];
}

export interface IBRoomGuest {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rate: {
    base_rate: number;
    changed_rate: number;
  };
  guest_info?: IBGuestInfo[];
}

export interface IBGuestInfo {
  title?: "Mr." | "Ms." | "Mrs." | "Mstr.";
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  country_id?: number;
  address?: string;
  passport_no?: string;
  type: "adult" | "child" | "infant";
  is_room_primary_guest: boolean;
}

export interface IBtocBooking {
  hotel_code: number;
  booking_reference: string;
  guest_id: number;
  total_nights: number;
  booking_date: string;
  voucher_no?: string;
  check_in: string;
  check_out: string;
  booking_type: string;
  status: string;
  is_individual_booking: boolean;
  sub_total?: number;
  total_amount?: number;
  comments?: string;
  book_from: "web" | "portal";
  created_by: number;
  payment_status: "paid" | "unpaid";
}

export interface IBtocbookingRooms {
  booking_id: number;
  room_type_id: number;
  check_in: string;
  check_out: string;
  status: "pending";
  checked_in_at?: string;
  checked_out_at?: string;
  adults: number;
  children: number;
  changed_rate: number;
  base_rate: number;
  unit_base_rate: number;
  unit_changed_rate: number;
}

export interface IgetAllBooking {
  booking_reference: string;
  booking_type: "B" | "C";
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  payment_status: "paid" | "unpaid" | "partial";
  total_amount: number;
  total_nights: number;
  check_in: string;
  check_out: string;
  booking_date: string;
}

export interface IGetSingleBooking {
  booking_reference: string;
  booking_type: "B" | "C";
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  payment_status: "paid" | "unpaid";
  total_amount: number;
  total_nights: number;
  check_in: string;
  check_out: string;
  booking_date: string;

  holder: {
    title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };

  rooms: {
    room_type: string;
    adults: number;
    children: number;
    guests: {
      title: string;
      name: string;
      surname: string;
    }[];
  }[];
}
