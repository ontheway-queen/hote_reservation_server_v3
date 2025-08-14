"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Schema {
    constructor() {
        this.PUBLIC_SCHEMA = "public";
        this.RESERVATION_SCHEMA = "hotel_reservation";
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
        };
    }
}
exports.default = Schema;
//# sourceMappingURL=schema.js.map