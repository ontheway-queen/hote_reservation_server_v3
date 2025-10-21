export interface IcreateRolePermission {
  role_id: Number;
  hotel_code: Number;
  res_permission_id: Number;
  read: number;
  write: number;
  update: number;
  delete: number;
  created_by?: Number;
}

interface HotelContactDetails {
  phone: string | null;
  fax: string | null;
  address: string | null;
  website_url: string | null;
  email: string | null;
  logo: string | null;
}

export interface IUserAdminWithHotel {
  id: number;
  email: string;
  hotel_code: number | string;
  hotel_name: string;
  phone: string | null;
  password: string;
  photo: string | null;
  name: string;
  hotel_status: "active" | "disabled" | "expired";
  status: boolean;
  role_id: number | null;
  role_name: string | null;
  created_at: Date | string;
  hotel_contact_details: HotelContactDetails;
}

export interface IsingleRolePermission {
  role_id: number;
  role_name: string;
  hotel_code: number;
  init_role: boolean;
  permissions: {
    permission_group_id: number;
    permission_group_name: string;
    res_permission_id: number;
    permission_id: number;
    permission_name: string;
    read: 0 | 1;
    write: 0 | 1;
    update: 0 | 1;
    delete: 0 | 1;
  }[];
}
