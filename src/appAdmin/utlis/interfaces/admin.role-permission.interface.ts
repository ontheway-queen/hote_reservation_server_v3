export interface IcreateRolePermission {
  role_id: Number;
  hotel_code: Number;
  h_permission_id: Number;
  read: number;
  write: number;
  update: number;
  delete: number;
  created_by?: Number;
}
