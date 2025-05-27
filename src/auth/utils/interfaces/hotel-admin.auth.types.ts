import { bool } from "aws-sdk/clients/signer";

export interface ILoginRes {
  success: boolean;
  message: string;
  code: number;
  data?: {
    id: number;
    name: string;
  };
  token?: string;
}

export interface ICreateUserAdminPayload {
  hotel_code: number;
  name: string;
  photo?: string;
  email: string;
  phone?: string;
  role: number;
  password: string;
  init_creds: boolean;
}

export interface IUpdateAdminPayload {
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: number;
  password?: string;
}
