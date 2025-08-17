"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const adminBtoc_controller_1 = __importDefault(require("../controllers/adminBtoc.controller"));
class AdminBtocRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminBtoc_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // update hotel b2c site config
        this.router
            .route("configuration")
            .patch(this.controller.updateSiteConfiguration);
    }
}
exports.default = AdminBtocRouter;
//# sourceMappingURL=adminBtoc.router.js.map