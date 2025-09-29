"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const money_reciept_controller_1 = __importDefault(require("../controllers/money-reciept.controller"));
class MoneyRecieptRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new money_reciept_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/by-folio-id/:id")
            .get(this.controller.getMoneyReceiptByFolio);
        // get single money receipt by id
        this.router.route("/:id").get(this.controller.getMoneyReceiptById);
        this.router.route("/").get(this.controller.createMoneyReceipt);
    }
}
exports.default = MoneyRecieptRouter;
//# sourceMappingURL=money-reciept.router.js.map