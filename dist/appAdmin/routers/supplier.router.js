"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const supplier_controller_1 = __importDefault(require("../controllers/supplier.controller"));
class SupplierRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new supplier_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createSupplier)
            .get(this.controller.getAllSupplier);
        this.router
            .route("/payment")
            .post(this.controller.supplierPayment)
            .get(this.controller.getAllSupplierPayment);
        this.router
            .route("/payment/by-sup-id/:id")
            .get(this.controller.getSingleSupplierPaymentById);
        this.router
            .route("/transaction")
            .get(this.controller.getAllSupplierTransaction);
        this.router
            .route("/transaction/by-sup/:id")
            .get(this.controller.getSingleSupplierTransaction);
        this.router
            .route("/invoice/by-sup-id/:id")
            .get(this.controller.getAllSupplierInvoiceById);
        // edit Supplier
        this.router
            .route("/:id")
            .patch(this.controller.updateSupplier)
            .delete(this.controller.deleteSupplier);
    }
}
exports.default = SupplierRouter;
//# sourceMappingURL=supplier.router.js.map