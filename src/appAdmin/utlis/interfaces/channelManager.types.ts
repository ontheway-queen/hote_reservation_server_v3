export interface IgetAllChannel {
  id: number;
  name: string;
  is_internal: boolean;
}

export interface IchannelAllocationReqBody {
  room_type_id: number;
  channel_id: number;
  total_allocated_rooms: number;
  from_date: string;
  to_date: string;
  rate_plans: number[];
}
