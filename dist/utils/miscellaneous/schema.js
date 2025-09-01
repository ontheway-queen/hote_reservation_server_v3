"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Schema {
    constructor() {
        this.PUBLIC_SCHEMA = "public";
        this.CM_SCHEMA = "channel_manager";
        this.RESERVATION_SCHEMA = "hotel_reservation";
        this.HR_SCHEMA = "hr";
        this.DBO_SCHEMA = "dbo";
        this.BTOC_SCHEMA = "btoc";
        this.M_SCHEMA = "management";
        this.RESTAURANT_SCHEMA = "hotel_restaurant";
        this.FLEET_SCHEMA = "fleet_management";
        this.ACC_SCHEMA = "acc";
        this.TABLES = {
            blood_group: "blood_group",
            months: "months",
            accounts: "accounts",
            room_types: "room_types",
            hotels: "hotels",
        };
    }
}
exports.default = Schema;
//# sourceMappingURL=schema.js.map