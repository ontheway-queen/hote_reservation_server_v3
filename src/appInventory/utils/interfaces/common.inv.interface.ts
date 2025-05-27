export interface ICreateCommonInvPayload {
  hotel_code?: number;
  name: string;
  created_by: number;
}

export interface IUpdateCommonInvPayload {
  name: string;
  status: number;
  updated_by: number;
}

export interface ICreateInvSupplierPayload {
  hotel_code?: number;
  res_id?: number;
  name: string;
  phone: string;
  created_by: number;
}

export interface IUpdateInvSupplierPayload {
  name?: string;
  phone?: string;
  status?: number;
  updated_by?: number;
  last_balance?: number;
}
