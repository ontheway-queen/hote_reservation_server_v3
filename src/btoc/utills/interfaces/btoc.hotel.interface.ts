export interface hotelSearchAvailabilityReqPayload {
  client_nationality: string;
  checkin: string;
  checkout: string;
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
