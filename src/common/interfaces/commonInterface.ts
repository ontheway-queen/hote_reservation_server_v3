export interface OTPType {
  type:
    | "forget_m_admin"
    | "forget_h_admin"
    | "forget_res_admin"
    | "forget_btoc_user"
    | "forget_restaurant_admin";
}
export interface IInsertOTPPayload extends OTPType {
  hashed_otp: string;
  email: string;
}

export interface IGetOTPPayload extends OTPType {
  email: string;
}

export interface IInsertAuditTrailPayload {
  adminId: number;
  details: string;
  status: boolean;
}

export interface IcommonInsertRes {
  command: string;
  rowCount: number;
  oid: number;
  rows: any[];
}

export interface ILimitSkip {
  limit: string;
  skip: string;
}

export interface ICreateAuditTrailPayload {
  hotel_code: number;
  created_by: number;
  type: "CREATE" | "GET" | "UPDATE" | "DELETE";
  details: string;
  payload?: object | string;
}

export interface IGetAuditTrailQuery {
  type?: "CREATE" | "GET" | "UPDATE" | "DELETE";
  created_by?: number;
  limit?: number;
  skip?: number;
  from_date?: string;
  to_date?: string;
}
