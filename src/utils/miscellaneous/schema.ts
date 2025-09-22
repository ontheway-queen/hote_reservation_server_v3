class Schema {
	public readonly PUBLIC_SCHEMA = "public";
	public readonly CM_SCHEMA = "channel_manager";
	public readonly RESERVATION_SCHEMA = "hotel_reservation";
	public readonly HOTEL_INVENTORY_SCHEMA = "hotel_inventory";
	public readonly HOTEL_SERVICE_SCHEMA = "hotel_service";
	public readonly HR_SCHEMA = "hr";
	public readonly DBO_SCHEMA = "dbo";
	public readonly BTOC_SCHEMA = "btoc";
	public readonly M_SCHEMA = "management";
	public readonly RESTAURANT_SCHEMA = "hotel_restaurant";
	public readonly FLEET_SCHEMA = "fleet_management";
	public readonly ACC_SCHEMA = "acc";
	public readonly TABLES = {
		blood_group: "blood_group",
		months: "months",
		accounts: "accounts",
		accounts_heads: "acc_heads",
		room_types: "room_types",
		hotels: "hotels",
		employee: "employee",
		user_admin: "user_admin",
	};
}
export default Schema;
