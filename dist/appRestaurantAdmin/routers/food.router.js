"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const food_controller_1 = __importDefault(require("../controllers/food.controller"));
class RestaurantFoodRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new food_controller_1.default();
        this.callV1Router();
    }
    callV1Router() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.RESTAURANT_FILES), this.controller.createFoodV2)
            .get(this.controller.getFoods);
        this.router.route("/prepared").post(this.controller.insertPreparedFood);
        this.router.route("/ingredients").get(this.controller.getAllProduct);
        this.router.route("/stocks").get(this.controller.geFoodStocks);
        this.router
            .route("/:id")
            .get(this.controller.getFood)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.RESTAURANT_FILES), this.controller.updateFood)
            .delete(this.controller.deleteFood);
    }
}
exports.default = RestaurantFoodRouter;
//# sourceMappingURL=food.router.js.map