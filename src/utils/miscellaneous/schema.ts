class Schema {
	public readonly PUBLIC_SCHEMA = "public";
	public readonly CM_SCHEMA = "channel_manager";
	public readonly RESERVATION_SCHEMA = "hotel_reservation";
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
	};
}
export default Schema;
