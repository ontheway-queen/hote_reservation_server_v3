"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const account_controller_1 = __importDefault(require("../controllers/account.controller"));
class AccountRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new account_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.get("/groups", this.controller.getAllGroups);
        this.router
            .route("/head")
            .get(this.controller.getallAccHeads)
            .post(this.controller.insertAccHead);
        this.router
            .route("/acc-head/:id")
            .get(this.controller.updateAccHead)
            .post(this.controller.deleteAccHead);
        this.router.route("/general-journal").get(this.controller.generalJournal);
        this.router.route("/acc-voucher").get(this.controller.allAccVouchers);
        this.router
            .route("/")
            .post(this.controller.createAccount)
            .get(this.controller.getAllAccount);
        this.router
            .route("/balance-transfer")
            .post(this.controller.balanceTransfer);
        this.router.route("/:id").patch(this.controller.updateAccount);
    }
}
exports.default = AccountRouter;
//# sourceMappingURL=account.router.js.map