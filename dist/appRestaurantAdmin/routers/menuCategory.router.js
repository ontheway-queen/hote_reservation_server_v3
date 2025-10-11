"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const menuCategory_controller_1 = __importDefault(require("../controllers/menuCategory.controller"));
class RestaurantMenuCategoryRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new menuCategory_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.controller.createMenuCategory)
            .get(this.controller.getMenuCategories);
        this.router
            .route("/:id")
            .patch(this.controller.updateMenuCategory)
            .delete(this.controller.deleteMenuCategory);
    }
}
exports.default = RestaurantMenuCategoryRouter;
//# sourceMappingURL=menuCategory.router.js.map