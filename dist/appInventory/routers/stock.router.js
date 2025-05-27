"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const stock_controller_1 = __importDefault(require("../controllers/stock.controller"));
class StockInvRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new stock_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //=================== stock ======================//
        // stock
        this.router
            .route("/")
            .post(this.controller.createStock)
            .get(this.controller.getAllStock);
        // single Stock
        this.router.route("/:id").get(this.controller.getSingleStock);
    }
}
exports.default = StockInvRouter;
//# sourceMappingURL=stock.router.js.map