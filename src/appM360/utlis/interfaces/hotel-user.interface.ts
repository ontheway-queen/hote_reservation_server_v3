export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  passport_number?: string;
  country_id?: number;
  is_active?: boolean;
}

export interface IUpdateUserPayload {
  email?: string;
  password: string;
}
