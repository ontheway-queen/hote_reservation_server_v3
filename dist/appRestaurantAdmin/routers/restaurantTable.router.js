"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const restaurantTable_controller_1 = __importDefault(require("../controllers/restaurantTable.controller"));
class RestaurantTableRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new restaurantTable_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.controller.createTable)
            .get(this.controller.getTables);
        this.router
            .route("/:id")
            .patch(this.controller.updateTable)
            .delete(this.controller.deleteTable);
    }
}
exports.default = RestaurantTableRouter;
//# sourceMappingURL=restaurantTable.router.js.map