"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocModels = void 0;
const btoc_reservation_model_1 = require("./BtocModel/btoc.reservation.model");
class BtocModels {
    constructor(db) {
        this.db = db;
    }
    btocReservationModel(trx) {
        return new btoc_reservation_model_1.BtocReservationModel(trx || this.db);
    }
}
exports.BtocModels = BtocModels;
//# sourceMappingURL=btoc.rootModel.js.map