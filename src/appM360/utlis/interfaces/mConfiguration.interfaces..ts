export interface IPermissions {
  permission_id: number;
  permission_name: string;
  hotel_permission_id: number;
  permission_group_id: number;
  permission_group_name: string;
}
export interface IhotelPermissions {
  hotel_code: number;
  name: string;
  permissions: IPermissions[];
}

export interface ICreateRoomTypeAmenitiesPayload {
  name: string;
}

export interface IUpdateRoomTypeAmenitiesPayload {
  room_amenities: string;
  status: number;
}
