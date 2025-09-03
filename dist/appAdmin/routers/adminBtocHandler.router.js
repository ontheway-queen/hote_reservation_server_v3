"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const siteConfiguration_1 = __importDefault(require("./siteConfiguration"));
class AdminBtocHandlerRouter extends abstract_router_1.default {
    // private controller = new AdminBtocHandlerController();
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        this.router.use("/site-config", new siteConfiguration_1.default().router);
    }
}
exports.default = AdminBtocHandlerRouter;
//# sourceMappingURL=adminBtocHandler.router.js.map