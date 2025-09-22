"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const serviceCategories_controller_1 = __importDefault(require("../controllers/serviceCategories.controller"));
class ServiceCategoriesRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new serviceCategories_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createServiceCategory)
            .get(this.controller.getAllServiceCategories);
        this.router
            .route("/:id")
            .patch(this.controller.updateServiceCategory)
            .delete(this.controller.deleteServiceCategory);
    }
}
exports.default = ServiceCategoriesRouter;
//# sourceMappingURL=serviceCategories.router.js.map