"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocModel = void 0;
const userProfileModel_1 = __importDefault(require("./userProfileModel/userProfileModel"));
class BtocModel {
    constructor(db) {
        this.db = db;
    }
    UserProfileModel(trx) {
        return new userProfileModel_1.default(trx || this.db);
    }
}
exports.BtocModel = BtocModel;
//# sourceMappingURL=btoc.rootModel.js.map