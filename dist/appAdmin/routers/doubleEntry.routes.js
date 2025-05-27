"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_routers_1 = __importDefault(require("../../../abstracts/abstract.routers"));
const doubleEntry_controllers_1 = __importDefault(require("./doubleEntry.controllers"));
class DoubleEntryRoutes extends abstract_routers_1.default {
    constructor() {
        super();
        this.controllers = new doubleEntry_controllers_1.default();
        this.callRouter();
    }
    callRouter() {
        this.routers.get('/groups', this.controllers.allGroups);
        this.routers
            .route('/acc-head')
            .get(this.controllers.allAccHeads)
            .post(this.controllers.insertAccHead);
        this.routers
            .route('/acc-head/:id')
            .get(this.controllers.updateAccHead)
            .post(this.controllers.deleteAccHead);
        this.routers.route('/general-journal').get(this.controllers.generalJournal);
        this.routers.route('/acc-voucher').get(this.controllers.allAccVouchers);
    }
}
exports.default = DoubleEntryRoutes;
//# sourceMappingURL=doubleEntry.routes.js.map