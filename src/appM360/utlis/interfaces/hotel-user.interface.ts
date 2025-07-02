export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country_code?: string;
  passport_number?: string;
  nationality?: string;
  country?: string;
  is_active?: boolean;
}

export interface IUpdateUserPayload {
  email?: string;
  password: string;
}
