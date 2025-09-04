"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocPaymentRouter = void 0;
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const btoc_payment_controller_1 = require("../controllers/btoc.payment.controller");
class BtocPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new btoc_payment_controller_1.BtocPaymentController();
        this.callRouter();
    }
    callRouter() {
        // this.router.route("/").post(this.controller.createPayment);
        // this.router
        //   .route("/transaction/:id")
        //   .get(
        //     this.controller.getAllMoneyReceiptByinvoiceID);
        this.router
            .route("/surjopay-order")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.BTOC_BOOKING_FILES), this.controller.createSurjopayPaymentOrder);
        // this.router.route("/invoice").get(this.controller.getInvoice);
        // this.router.route("/invoice/:id").get(this.controller.singleInvoice);
    }
}
exports.BtocPaymentRouter = BtocPaymentRouter;
//# sourceMappingURL=btoc.payment.router.js.map