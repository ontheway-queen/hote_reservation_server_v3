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
export interface IUpdateRoomAvailabilitiesPayload {
	booked_rooms: number;
	hold_rooms: number;
	date: string;
	room_type_id: number;
	total_rooms: number;
	available_rooms: number;
}

export interface IgetRoomAvailabilitiesByRoomTypeId {
	id: number;
	total_rooms: number;
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

export interface IOccupiedRoom {
	id: number;
	adults: number;
	children: number;
	infant: number;
	booking_id: number;
	total_nights: number;
	status: string;
	check_in: string;
	check_out: string;
	booking_date: string;
	room_id: number;
	room_name: string;
	floor_no: number;
	guest: {
		id: number;
		name: string;
		email: string;
		phone: string;
	};
	room_type: {
		id: number;
		name: string;
	};
}
