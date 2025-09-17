"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const inventory_controller_1 = __importDefault(require("../controllers/inventory.controller"));
class InventoryRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new inventory_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getInventoryDetailsController);
        this.router
            .route("/:id")
            .get(this.controller.getSingleInventoryDetailsController);
    }
}
exports.default = InventoryRouter;
//# sourceMappingURL=inventory.router.js.map