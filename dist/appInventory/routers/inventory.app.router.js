"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const common_inv_router_1 = __importDefault(require("./common.inv.router"));
const product_router_1 = __importDefault(require("./product.router"));
const purchase_router_1 = __importDefault(require("./purchase.router"));
const stock_router_1 = __importDefault(require("./stock.router"));
class HotelInventoryRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        // common
        this.router.use("/common", new common_inv_router_1.default().router);
        // product
        this.router.use("/product", new product_router_1.default().router);
        // purchase
        this.router.use("/purchase", new purchase_router_1.default().router);
        // stock
        this.router.use("/stock", new stock_router_1.default().router);
    }
}
exports.default = HotelInventoryRouter;
//# sourceMappingURL=inventory.app.router.js.map