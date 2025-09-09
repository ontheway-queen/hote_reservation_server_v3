export interface OTPType {
	type:
		| "forget_m_admin"
		| "forget_h_admin"
		| "forget_res_admin"
		| "forget_btoc_user";
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
