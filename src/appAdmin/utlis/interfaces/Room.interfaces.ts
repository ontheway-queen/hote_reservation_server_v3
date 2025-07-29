import { number } from "joi";

export interface IcreateRoomBody {
  room_name: string;
  floor_no: number;
  room_type_id: number;
}

export interface IgetAllRoom {
  id: number;
  hotel_code: number;
  room_name: string;
  floor_no: number;
  room_type_id: number;
  room_type_name: string;
}

export interface IcreateRoomPayload {
  room_name: string;
  floor_no: number;
  room_type_id: number;
  hotel_code: number;
  created_by: number;
}

export interface IinsertRoomAvailabilitiesPayload {
  hotel_code: number;
  date: string;
  room_type_id: number;
  total_rooms: number;
  available_rooms: number;
}
// export interface IUpdateRoomAvailabilitiesPayload {
//   booked_rooms: number;
//   hold_rooms: number;
//   date: string;
//   room_type_id: number;
//   total_rooms: number;
//   available_rooms: number;
// }

export interface IUpdateRoomAvailabilitiesPayload {
  id: number;
  total_rooms: number;
  available_rooms: number;
}

export interface IgetRoomAvailabilitiesByRoomTypeId {
  id: number;
  date: string;
  total_rooms: number;
  booked_rooms: number;
  hold_rooms: number;
  available_rooms: number;
}

export interface IupdateRoomBody {
  room_name: string;
  floor_no: number;
  room_type_id: number;
  is_deleted?: boolean;
  status:
    | "in_service"
    | "out_of_service"
    | "clean"
    | "dirty"
    | "under_maintenance";
}

export interface IOccupiedRoomList {
  id: number;
  hotel_code: number;
  room_no: string;
  floor_no: number;
  room_type_id: number;
  room_type_name: string;
  status: string;
  bookings: Booking[];
}

export interface Booking {
  booking_id: number;
  booking_reference: string;
  check_in: string;
  check_out: string;
  booking_type: string;
  booking_status: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_id: number;
}
