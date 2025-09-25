"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const purchase_controller_1 = __importDefault(require("../controllers/purchase.controller"));
class PurchaseInvRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new purchase_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // purchase
        this.router
            .route("/")
            .post(this.controller.createPurchase)
            .get(this.controller.getAllPurchase);
        // create purchase money reciept
        this.router
            .route("/money-reciept")
            .post(this.controller.createPurchaseMoneyReciept);
        // get money receipt by inoice id
        this.router
            .route("/receipt-by/purchase/:id")
            .get(this.controller.getMoneyReceiptById);
        this.router
            .route("/invoice-by/purchase/:id")
            .get(this.controller.getInvoiceByPurchaseId);
        // single purchase
        this.router.route("/:id").get(this.controller.getSinglePurchase);
    }
}
exports.default = PurchaseInvRouter;
//# sourceMappingURL=purchase.router.js.map