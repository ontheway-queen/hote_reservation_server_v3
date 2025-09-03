"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocCommonRouter = void 0;
const express_1 = require("express");
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const authChecker_1 = __importDefault(require("../../common/middleware/authChecker/authChecker"));
const btocCommon_controller_1 = require("../controllers/btocCommon.controller");
class BtocCommonRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.authChecker = new authChecker_1.default();
        this.controller = new btocCommon_controller_1.BtocCommonController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/gateways").get(this.controller.getAllPaymentGateway);
    }
}
exports.BtocCommonRouter = BtocCommonRouter;
//# sourceMappingURL=btocCommon.router.js.map