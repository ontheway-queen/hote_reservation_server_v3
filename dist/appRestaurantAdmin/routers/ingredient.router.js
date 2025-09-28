"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const ingredient_controller_1 = __importDefault(require("../controllers/ingredient.controller"));
class RestaurantIngredientRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new ingredient_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.controller.createMeasurement)
            .get(this.controller.getIngredients);
        this.router
            .route("/:id")
            .patch(this.controller.updateIngredient)
            .delete(this.controller.deleteIngredient);
    }
}
exports.default = RestaurantIngredientRouter;
//# sourceMappingURL=ingredient.router.js.map