"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
class ProductInvRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new product_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //=================== Product ======================//
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.INVENTORY_FILES), this.controller.createProduct)
            .get(this.controller.getAllProduct);
        this.router
            .route("/:id")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.INVENTORY_FILES), this.controller.updateProduct);
        //=================== Damaged Purchase ======================//
        // Damaged
        this.router
            .route("/damaged")
            .post(this.controller.createDamagedProduct)
            .get(this.controller.getAllDamagedProduct);
        // single Damaged
        this.router
            .route("/damaged/:id")
            .get(this.controller.getSingleDamagedProduct);
    }
}
exports.default = ProductInvRouter;
//# sourceMappingURL=product.router.js.map